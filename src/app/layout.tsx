import { Metadata, Viewport } from 'next';
import { Inter as FontSans } from 'next/font/google';

import '@/app/globals.css';

import { isProduction } from '@/lib/env';
import { cn } from '@/lib/ui';
import { Providers } from '@/components/providers';
import { TailwindIndicator } from '@/components/tailwind-indicator';

export const metadata: Metadata = {
  title: {
    default: 'scaffold',
    template: `%s - scaffold`,
  },
  description: 'Hello world',
  robots: isProduction ? 'follow, index' : 'noindex',
  icons: {
    icon: '/favicon.ico',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: 'white' },
    { media: '(prefers-color-scheme: dark)', color: 'black' },
  ],
};

interface RootLayoutProps {
  children: React.ReactNode;
}

const fontSans = FontSans({
  subsets: ['latin'],
  variable: '--font-sans',
});

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          'bg-background min-h-screen font-sans antialiased',
          fontSans.variable,
        )}
      >
        <Providers>
          {children}
          <TailwindIndicator />
        </Providers>
      </body>
    </html>
  );
}
