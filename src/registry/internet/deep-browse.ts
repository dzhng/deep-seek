import { compact, uniqBy } from 'lodash';

import { browse, BrowseResult } from '@/services/browse';
import { normalizeUrl } from '@/lib/url';
import { extractUrls } from '@/registry/internet/extract-urls';

// browse the given url, recursively click into other links, extract data based on given instruction
export async function deepBrowse({
  initialUrl,
  direction,
  slowFallback = true,
  // by default, only browse the given site, don't navigate to others
  maxBrowse = 1,
  maxContentLen = 60_000,
  preserveOrigin = true,
  minRelevance = 0.2,
}: {
  initialUrl: string;
  direction?: string;
  // set to true to use apify as a fallback (default)
  slowFallback?: boolean;
  // total number of links that will be browsed, including the original link (defaults to 1)
  maxBrowse?: number;
  // set a limit to the max size of the content that should be returned, set to 0 for unlimited content len (not recommended, system should always have limit to avoid overflowing queue/db)
  maxContentLen?: number;
  // if set to true, only scrape additional websites with same origin as initialUrl
  preserveOrigin?: boolean;
  // the minumim relevance score between 0 - 1 that's required for a follow on browse
  minRelevance?: number;
}): Promise<BrowseResult[]> {
  const normalizedUrl = normalizeUrl(initialUrl);
  const res = await browse({
    url: normalizedUrl,
    slowFallback,
    maxContentLen,
  });
  if (!res) {
    return [];
  }

  if (maxBrowse <= 1) {
    return [res];
  }

  if (!direction) {
    throw new Error('Direction is needed to extract urls');
  }

  const urls = await extractUrls({
    page: res,
    url: normalizedUrl,
    direction,
  });

  const origin = new URL(normalizedUrl).origin;
  const cleanedUrls = urls
    .map(l => ({ ...l, url: normalizeUrl(l.url) }))
    .filter(l => (preserveOrigin ? new URL(l.url).origin === origin : true)) // stick to same origin
    .filter(l => l.relevance >= minRelevance) // filter out low relevance
    .filter(l => l.url !== normalizedUrl); // filter out original url

  cleanedUrls.sort((a, b) => b.relevance - a.relevance);
  const linksToBrowse = uniqBy(cleanedUrls, 'url').slice(0, maxBrowse - 1);

  const allResults = compact(
    await Promise.all(
      linksToBrowse.map(link =>
        browse({
          url: link.url,
          slowFallback,
          maxContentLen,
        }),
      ),
    ),
  );

  return [res, ...allResults];
}
