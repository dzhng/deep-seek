import { compact, flatten } from 'lodash';

import { BrowseResult } from '@/services/browse';
import { classifyContent } from '@/registry/internet/classify-content';
import { extractContent } from '@/registry/internet/extract-content';
import { filterContent } from '@/registry/internet/filter-content';
import { mergeContent } from '@/registry/internet/merge-content';
import { ContentResultWithSources } from '@/registry/types';

export async function retrieve({
  results,
  nodeType,
}: {
  results: (BrowseResult & { query: string | null })[];
  nodeType: string;
}): Promise<ContentResultWithSources[]> {
  // go through all the browse results and extract content to build knowledge graph
  const contentRes = await Promise.allSettled(
    results.map(async (r): Promise<ContentResultWithSources[]> => {
      const type = await classifyContent({ entity: nodeType, content: r });
      console.log('Content classified', type, r.title);

      if (type === 'content') {
        return [
          {
            sources: [{ url: r.url, title: r.title }],
            title: r.title ?? '',
            text: r.content,
            reason: 'Found relevant content',
          },
        ];
      } else if (type === 'list') {
        const res = await extractContent({
          page: r,
          query: r.query ?? 'Extract all relevant content',
          nodeType,
        });
        return res.map(content => ({
          ...content,
          sources: [{ title: r.title, url: r.url }],
        }));
      } else {
        return [];
      }
    }),
  );

  const content = flatten(
    compact(contentRes.map(r => (r.status === 'fulfilled' ? r.value : null))),
  );

  const merged = await mergeContent({ content, nodeType });
  const filtered = await filterContent({ content: merged, nodeType });
  return filtered;
}
