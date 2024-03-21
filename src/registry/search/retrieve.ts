import { compact, flatten } from 'lodash';

import { BrowseResult } from '@/services/browse';
import { extractContent } from '@/registry/internet/extract-content';
import {
  ContentResultWithUrls,
  mergeContent,
} from '@/registry/internet/merge-content';

export async function retrieve({
  results,
  nodeType,
}: {
  results: (BrowseResult & { query: string | null })[];
  nodeType: string;
}): Promise<ContentResultWithUrls[]> {
  // go through all the browse results and extract content to build knowledge graph
  const contentRes = await Promise.allSettled(
    results.map(async r => {
      const res = await extractContent({
        page: r,
        query: r.query ?? 'Extract all relevant content',
        nodeType,
      });
      return res.map(content => ({ ...content, urls: [r.url] }));
    }),
  );

  const content = flatten(
    compact(contentRes.map(r => (r.status === 'fulfilled' ? r.value : null))),
  );

  return mergeContent({ content, nodeType });
}
