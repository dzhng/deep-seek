import { RecursiveCharacterTextSplitter } from 'zod-gpt';

import { normalizeUrl } from '@/lib/url';
import { processWebpageWithApify } from '@/registry/internet/processor/apify';
import { processWebpageWithBrightData } from '@/registry/internet/processor/brightdata';
import { processLinkedInProfile } from '@/registry/internet/processor/linkedin';
import { processPdf } from '@/registry/internet/processor/pdf';

export type BrowseResults = {
  title?: string;
  content: string;
};

async function browseBrightData({
  url,
  attempt = 0,
}: {
  url: string;
  attempt?: number;
}) {
  // build different variations of the urls, since some sites will fail by default
  // skip the initial http url, since the brightdata fetch implementation don't seem to follow https redirect too well
  const urls = [
    normalizeUrl(url, { forceHttp: false, forceHttps: true }),
    // sometimes, sites will expect an explicit `www`
    normalizeUrl('www.' + normalizeUrl(url, { stripProtocol: true }), {
      stripWWW: false,
      forceHttp: false,
      forceHttps: true,
    }),
  ];
  const normalizedUrl = urls[attempt];
  if (!normalizedUrl) {
    return;
  }

  const processed = await processWebpageWithBrightData(normalizedUrl);
  // do a sanity check to make sure title doesn't contain known keywords of failure
  if (
    !processed ||
    processed.text.length < 280 || // if there's too little text, this url is probably bad
    processed.title.toLowerCase().startsWith('error') ||
    processed.title.toLowerCase().startsWith('just a moment') || // cloudflare checker
    processed.title.toLowerCase().includes('access denied') ||
    processed.title.toLowerCase().includes('bad gateway') ||
    processed.title.toLowerCase().includes('not found')
  ) {
    console.info(
      `BrightData browsing ${normalizedUrl} attempt ${attempt} failed, retrying...`,
      processed?.text.length,
      processed?.title,
    );
    return browseBrightData({ url, attempt: attempt + 1 });
  }

  return processed;
}

async function browseApify({
  url,
  attempt = 0,
}: {
  url: string;
  attempt?: number;
}) {
  // build different variations of the urls, since some sites will fail by default
  const urls = [
    normalizeUrl(url, { forceHttp: true, forceHttps: false }),
    // sometimes, sites will expect a `www`
    normalizeUrl('www.' + normalizeUrl(url, { stripProtocol: true }), {
      stripWWW: false,
      forceHttp: false,
      forceHttps: true,
    }),
    // sometimes, http sites will fail, try again but force https
    normalizeUrl(url, { forceHttp: false, forceHttps: true }),
  ];
  const normalizedUrl = urls[attempt];
  if (!normalizedUrl) {
    return;
  }

  const apify = await processWebpageWithApify(normalizedUrl);
  // do a sanity check to make sure title doesn't contain known keywords of failure
  if (
    !apify ||
    apify.text.length < 280 || // if there's too little text, this url is probably bad
    apify.title.toLowerCase().startsWith('error') ||
    apify.title.toLowerCase().startsWith('just a moment') || // cloudflare checker
    apify.title.toLowerCase().includes('access denied') ||
    apify.title.toLowerCase().includes('bad gateway') ||
    apify.title.toLowerCase().includes('not found')
  ) {
    console.info(
      `Apify browsing (${normalizedUrl}) attempt ${attempt} failed, retrying...`,
      apify?.text.length,
      apify?.title,
    );
    return browseApify({ url, attempt: attempt + 1 });
  }

  return apify;
}

async function browseUrl({
  url,
  slowFallback,
}: {
  url: string;
  slowFallback?: boolean;
}): Promise<BrowseResults | undefined> {
  // forcehttp should already be set to true, but make extra sure since some websites
  // won't work if you just go to https right away
  const normalizedUrl = normalizeUrl(url, {
    forceHttp: true,
    forceHttps: false,
  });

  const isPdf = normalizedUrl.toLowerCase().endsWith('.pdf');
  if (isPdf) {
    const res = await processPdf(normalizedUrl);
    if (!res) {
      return;
    }

    return {
      content: res.text,
    };
  }

  const isLinkedIn = normalizedUrl.includes('linkedin.com/in/');
  if (isLinkedIn) {
    const res = await processLinkedInProfile(normalizedUrl);
    return res;
  }

  const brightdata = await browseBrightData({ url });
  if (brightdata) {
    return {
      title: brightdata.title,
      content: brightdata.text,
    };
  }

  // apify is very slow, so only use if it's flagged
  if (!slowFallback) {
    console.info('Scraping failed without slow fallback: ', normalizedUrl);
    return;
  }

  console.info('Brightdata failed, falling back to Apify');
  const apify = await browseApify({ url });
  if (apify) {
    return {
      title: apify.title,
      content: apify.text,
    };
  }

  console.error('Scraping failed for url: ' + normalizedUrl);
  return;
}

export async function browse({
  url,
  maxContentLen,
  slowFallback = true,
}: {
  url: string;
  // Set this param to put a limit on max number of characters to return from the content key. Note that it won't return that number exactly, as the content is split via a text splitter that'll try to chunk it at natural split points.
  maxContentLen?: number;
  slowFallback?: boolean;
}): Promise<BrowseResults | undefined> {
  try {
    const textSplitter = maxContentLen
      ? new RecursiveCharacterTextSplitter({
          chunkSize: maxContentLen,
        })
      : undefined;
    const res = await browseUrl({ url, slowFallback });
    if (res && textSplitter) {
      return {
        ...res,
        content: textSplitter.splitText(res.content)[0]?.trim(),
      };
    } else {
      return res;
    }
  } catch (e) {
    console.error('Error browsing url: ' + url, e);
    return;
  }
}
