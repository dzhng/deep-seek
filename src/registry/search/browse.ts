import { compact, flatten } from 'lodash';
import { NodeHtmlMarkdown } from 'node-html-markdown';
import { RecursiveCharacterTextSplitter } from 'zod-gpt';

import { BrowseResult } from '@/services/browse';
import { metaphor } from '@/services/metaphor';
import { minifyText, normalizeMarkdownHeadings } from '@/lib/format';
import { deepBrowse } from '@/registry/internet/deep-browse';
import { SearchResult } from '@/registry/search/search';

const MaxContentChunkSize = 60_000;

export async function browse({
  results,
}: {
  results: SearchResult[];
}): Promise<(BrowseResult & { query: string | null })[]> {
  const textSplitter = new RecursiveCharacterTextSplitter({
    chunkSize: MaxContentChunkSize,
  });

  // list of urls to use browser on, this is for fallback purposes only, if metaphor.getContents fails or errors
  const urlsToBrowse: { url: string; query: string | null }[] = [];

  // final return data
  const browseResults: (BrowseResult & { query: string | null })[] = [];

  try {
    const res = await metaphor.getContents(results.map(r => r.metaphorId));

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
        query: results.find(r => r.metaphorId === record.id)?.query ?? null,
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
    urlsToBrowse.push(...results.map(r => ({ url: r.link, query: r.query })));
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

  return browseResults;
}
