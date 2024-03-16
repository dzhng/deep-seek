'use client';

import { PropsWithChildren } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from 'next-themes';
import { Toaster } from 'react-hot-toast';

import { queryClient } from '@/services/react-query';
import { StateProvider } from '@/components/providers/state';
import { TrpcProvider } from '@/components/providers/trpc';

export function Providers({ children }: PropsWithChildren) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <QueryClientProvider client={queryClient}>
        <StateProvider>
          <TrpcProvider>{children}</TrpcProvider>
        </StateProvider>
      </QueryClientProvider>
      <Toaster />
    </ThemeProvider>
  );
}
