import { metaphor } from '@/services/metaphor';
import { normalizeUrl } from '@/lib/url';

export type SearchResult = {
  metaphorId: string;
  link: string;
  title?: string;
  snippet?: string;
  query: string;
};

export async function search({
  query,
  isNeural,
  category,
  numResults = 10,
}: {
  query: string;
  isNeural?: boolean;
  category?: string;
  numResults?: number;
}): Promise<SearchResult[]> {
  const searchResult = await metaphor.search(query, {
    type: isNeural ? 'neural' : 'keyword',
    category,
    numResults,
    useAutoprompt: true,
  });
  return searchResult.results?.map(r => ({
    metaphorId: r.id,
    link: normalizeUrl(r.url),
    title: r.title,
    query,
  }));
}
