import { ContentResult } from '@/registry/internet/extract-content';

// first see if the answer to the query is already in the content found, if not, do a search and aggregate
export async function enrichCell({
  query,
  content,
}: {
  query: string;
  content: ContentResult[];
}) {}
