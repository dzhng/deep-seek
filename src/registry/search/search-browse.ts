import { compact, flatten, uniqBy } from 'lodash';
import Metaphor from 'metaphor-node';
import { NodeHtmlMarkdown } from 'node-html-markdown';
import { RecursiveCharacterTextSplitter } from 'zod-gpt';

import { BrowseResults } from '@/services/browse';
import { minifyText, normalizeMarkdownHeadings } from '@/lib/format';
import { normalizeUrl } from '@/lib/url';
import { deepBrowse } from '@/registry/internet/deep-browse';
import { rankSearchResults } from '@/registry/search/rank';
import {
  generateAnswer,
  generateQueryQuestions,
} from '@/registry/search/research';

export type SearchResult = {
  metaphorId: string;
  link: string;
  title?: string;
  snippet?: string;
  originalQuery: string;
};

const metaphor = new Metaphor(process.env.METAPHOR_API_KEY ?? '');

const MaxContentChunkSize = 60_000;

export async function searchAndBrowse({ query }: { query: string }) {
  const { objective, queries } = await generateQueryQuestions(query);

  const intermediaryResults: SearchResult[] = [];

  await Promise.allSettled(
    queries.slice(0, 6).map(async query => {
      const searchResult = await metaphor.search(query, {
        type: 'keyword',
        useAutoprompt: true,
        numResults: 3,
      });
      const res = searchResult.results?.map(r => ({
        metaphorId: r.id,
        link: normalizeUrl(r.url),
        title: r.title,
        originalQuery: query,
      }));

      if (res) {
        intermediaryResults.push(...res);
      }
    }),
  );

  const results = uniqBy(intermediaryResults, r => r.link);
  const searchResults = await rankSearchResults(results, objective);

  // filter out low score results, and only inference with the top 8
  const filteredResults = searchResults.filter(r => r.score > 0.1).slice(0, 8);

  const textSplitter = new RecursiveCharacterTextSplitter({
    chunkSize: MaxContentChunkSize,
  });

  // list of urls to use browser on, this is for fallback purposes only, if metaphor.getContents fails or errors
  const urlsToBrowse: string[] = [];

  // final return data
  const content: BrowseResults[] = [];

  try {
    const res = await metaphor.getContents(
      filteredResults.map(r => r.metaphorId),
    );

    const contentRes = res.contents.map(record => {
      const content = record.extract
        ? normalizeMarkdownHeadings(
            minifyText(NodeHtmlMarkdown.translate(record.extract)),
          )
        : record.text;
      const data: BrowseResults = {
        url: record.url,
        title: record.title,
        content: content ? textSplitter.splitText(content)[0]?.trim() : '',
      };
      return data;
    });

    const invalidContent = contentRes.filter(r => !r.content);
    urlsToBrowse.push(...invalidContent.map(c => c.url));

    const validContent = contentRes.filter(r => r.content);
    content.push(...validContent);
  } catch (e) {
    console.warn('Error getting contents from metaphor', e);
    urlsToBrowse.push(...filteredResults.map(r => r.link));
  }

  // use fallback browser
  if (urlsToBrowse.length > 0) {
    const browseRes = await Promise.allSettled(
      urlsToBrowse.map(async url =>
        deepBrowse({
          initialUrl: url,
          maxBrowse: 1,
          slowFallback: false,
        }),
      ),
    );
    content.push(
      ...flatten(
        compact(
          browseRes.map(r => (r.status === 'fulfilled' ? r.value : null)),
        ),
      ),
    );
  }

  const res = await generateAnswer(objective, queries, content);
}
