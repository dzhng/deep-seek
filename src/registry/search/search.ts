import { compact, flatten, uniqBy } from 'lodash';

import { metaphor } from '@/services/metaphor';
import { normalizeUrl } from '@/lib/url';
import { rankSearchResults } from '@/registry/search/rank';

export type SearchResult = {
  metaphorId: string;
  link: string;
  title?: string;
  snippet?: string;
  query: string;
};

export async function search({
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
