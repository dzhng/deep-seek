'use client';

import React from 'react';
import { httpBatchLink } from '@trpc/client';

import { queryClient } from '@/services/react-query';
import { getBaseUrl } from '@/lib/trpc';
import { trpc } from '@/lib/trpc/client';

const trpcClient = trpc.createClient({
  links: [
    httpBatchLink({
      url: `${getBaseUrl()}/api/trpc`,
    }),
  ],
});

export function TrpcProvider({ children }: { children: React.ReactNode }) {
  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      {children}
    </trpc.Provider>
  );
}
