'use client';

import { QueryCache, QueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';

// Error handling pattern from this:
// https://tkdodo.eu/blog/react-query-error-handling#putting-it-all-together
export const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error, query) => {
      if (query.state.data !== undefined) {
        console.error(
          'Something went wrong with query: ',
          (error as any)?.message,
        );
        toast.error(
          'Whoops, something went wrong with the query, please try again.',
        );
      }
    },
  }),

  defaultOptions: {
    queries: {
      // fallback to the nearest error boundary if there are no cached data
      useErrorBoundary: (_, query) => query.state.data === undefined,
    },
  },
});
