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
  startPublishDate,
}: {
  query: string;
  isNeural?: boolean;
  category?: string;
  numResults?: number;
  startPublishDate?: Date;
}): Promise<SearchResult[]> {
  // parse the date but just ignore it if there's an error
  let dateString: string | undefined;
  try {
    if (startPublishDate) {
      dateString = startPublishDate.toISOString();
    }
  } catch {
    console.warn('Error parsing startPublishDate for search');
    dateString = undefined;
  }

  const searchResult = await metaphor.search(query, {
    type: isNeural ? 'neural' : 'keyword',
    category,
    numResults,
    useAutoprompt: true,
    startPublishedDate: dateString,
  });
  return searchResult.results?.map(r => ({
    metaphorId: r.id,
    link: normalizeUrl(r.url),
    title: r.title,
    query,
  }));
}
