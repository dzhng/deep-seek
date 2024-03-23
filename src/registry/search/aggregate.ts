import { compact, flatten } from 'lodash';

import { BrowseResult } from '@/services/browse';
import { aggregateContent } from '@/registry/internet/aggregate-content';
import { extractContent } from '@/registry/internet/extract-content';

export async function aggregate({
  results,
  query,
}: {
  results: (BrowseResult & { query: string | null })[];
  query: string;
}): Promise<{
  answer?: string;
  confidence: number;
  sources: { title?: string; url: string }[];
}> {
  // go through all the browse results and extract content to build knowledge graph
  const contentRes = await Promise.allSettled(
    results.map(async r => {
      const res = await extractContent({
        page: r,
        query: r.query ?? 'Extract all relevant content',
      });
      return res.map(content => ({
        ...content,
        sources: [{ title: r.title, url: r.url }],
      }));
    }),
  );

  const content = flatten(
    compact(contentRes.map(r => (r.status === 'fulfilled' ? r.value : null))),
  );

  const aggregated = await aggregateContent({ content, query });
  return {
    ...aggregated,
    sources: flatten(
      compact(aggregated.sources.map(idx => content[idx]?.sources)),
    ),
  };
}
