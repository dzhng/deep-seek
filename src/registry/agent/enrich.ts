import { compact, flatten } from 'lodash';

import { aggregateContent } from '@/registry/internet/aggregate-content';
import { aggregate } from '@/registry/search/aggregate';
import { browse } from '@/registry/search/browse';
import { generateQueryQuestions } from '@/registry/search/research';
import { search } from '@/registry/search/search';
import { ContentResultWithSources, TableCell } from '@/registry/types';

// first see if the answer to the query is already in the content found, if not, do a search and aggregate
export async function enrichCell({
  query,
  content,
}: {
  query: string;
  content: ContentResultWithSources[];
}): Promise<TableCell> {
  const answer = await aggregateContent({
    query,
    content,
  });

  if (answer.confidence > 0.3) {
    return {
      text: answer.answer,
      confidence: answer.confidence,
      sources: flatten(
        compact(answer.sources.map(idx => content[idx]?.sources)),
      ),
    };
  }

  // if confidence is low, retrieve and augment the answer with web data
  const expandedQuery = await generateQueryQuestions(query);
  const searchResults = await search(expandedQuery);
  const browseResults = await browse({ results: searchResults });
  const aggregatedAnswer = await aggregate({
    results: browseResults,
    query: expandedQuery.objective,
  });

  return aggregatedAnswer;
}
