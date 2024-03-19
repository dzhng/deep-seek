import { compact, flatten, uniqBy } from 'lodash';
import Metaphor from 'metaphor-node';
import { NodeHtmlMarkdown } from 'node-html-markdown';
import { RecursiveCharacterTextSplitter } from 'zod-gpt';

import { BrowseResults } from '@/services/browse';
import { minifyText, normalizeMarkdownHeadings } from '@/lib/format';
import { normalizeUrl } from '@/lib/url';
import { deepBrowse } from '@/registry/internet/deep-browse';
import { extractContent } from '@/registry/internet/extract-content';
import { rankSearchResults } from '@/registry/search/rank';
import { generateQueryQuestions } from '@/registry/search/research';

export type SearchResult = {
  metaphorId: string;
  link: string;
  title?: string;
  snippet?: string;
  query: string;
};

const MaxContentChunkSize = 60_000;
const metaphor = new Metaphor(process.env.METAPHOR_API_KEY ?? '');

async function search({
  objective,
  queries,
}: {
  objective: string;
  queries: string[];
}): Promise<SearchResult[]> {
  const searchRes = await Promise.allSettled(
    queries.slice(0, 6).map(async query => {
      const searchResult = await metaphor.search(query, {
        type: 'keyword',
        useAutoprompt: true,
        numResults: 3,
      });
      return searchResult.results?.map(r => ({
        metaphorId: r.id,
        link: normalizeUrl(r.url),
        title: r.title,
        query,
      }));
    }),
  );

  const intermediaryResults: SearchResult[] = flatten(
    compact(searchRes.map(r => (r.status === 'fulfilled' ? r.value : null))),
  );

  const results = uniqBy(intermediaryResults, r => r.link);
  const searchResults = await rankSearchResults(results, objective);

  // filter out low score results, and only inference with the top 8
  return searchResults.filter(r => r.score > 0.1).slice(0, 8);
}

export async function searchAndBrowse({
  query,
  nodesToExtract,
}: {
  query: string;
  // describe the type of nodes to extract for building the result knowledge graph
  nodesToExtract?: string[];
}) {
  const { objective, queries } = await generateQueryQuestions(query);
  const searchResults = await search({ objective, queries });

  const textSplitter = new RecursiveCharacterTextSplitter({
    chunkSize: MaxContentChunkSize,
  });

  // list of urls to use browser on, this is for fallback purposes only, if metaphor.getContents fails or errors
  const urlsToBrowse: { url: string; query: string | null }[] = [];

  // final return data
  const browseResults: (BrowseResults & { query: string | null })[] = [];

  try {
    const res = await metaphor.getContents(
      searchResults.map(r => r.metaphorId),
    );

    const contentRes = res.contents.map(record => {
      const content = record.extract
        ? normalizeMarkdownHeadings(
            minifyText(NodeHtmlMarkdown.translate(record.extract)),
          )
        : record.text;
      return {
        url: record.url,
        title: record.title,
        content: content ? textSplitter.splitText(content)[0]?.trim() : '',
        query:
          searchResults.find(r => r.metaphorId === record.id)?.query ?? null,
      };
    });

    const invalidContent = contentRes.filter(r => !r.content);
    urlsToBrowse.push(
      ...invalidContent.map(c => ({ url: c.url, query: c.query })),
    );

    const validContent = contentRes.filter(r => r.content);
    browseResults.push(...validContent);
  } catch (e) {
    console.warn('Error getting contents from metaphor', e);
    urlsToBrowse.push(
      ...searchResults.map(r => ({ url: r.link, query: r.query })),
    );
  }

  // use fallback browser for if metaphore endpoint goes down (may happen sometimes when index is incomplete)
  if (urlsToBrowse.length > 0) {
    const browseRes = await Promise.allSettled(
      urlsToBrowse.map(async r => {
        const res = await deepBrowse({
          initialUrl: r.url,
          maxBrowse: 1,
          slowFallback: false,
          direction: r.query ?? undefined,
        });
        return res.map(browseResult => ({ ...browseResult, query: r.query }));
      }),
    );
    browseResults.push(
      ...flatten(
        compact(
          browseRes.map(r => (r.status === 'fulfilled' ? r.value : null)),
        ),
      ),
    );
  }

  // go through all the browse results and extract content to build knowledge graph
  const contentRes = await Promise.allSettled(
    browseResults.map(async r => {
      const res = await extractContent({
        page: r,
        query: r.query ?? 'Extract all relevant content',
      });
      return res.map(content => ({ ...content, url: r.url }));
    }),
  );

  const content = flatten(
    compact(contentRes.map(r => (r.status === 'fulfilled' ? r.value : null))),
  );

  return content;
}
