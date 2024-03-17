import axios from 'axios';

import { processHtml } from './html';

async function scrape(url: string): Promise<string> {
  const [host, port] = (process.env.BRIGHTDATA_PROXY_HOST ?? '').split(':');
  const res = await axios.get<string>(url, {
    timeout: 60_000,
    proxy: {
      protocol: 'http',
      host,
      port: Number(port),
      auth: {
        username: process.env.BRIGHTDATA_PROXY_USERNAME ?? '',
        password: process.env.BRIGHTDATA_PROXY_PASSWORD ?? '',
      },
    },
  });

  return res.data;
}

export async function processWebpageWithBrightData(
  url: string,
): Promise<{ title: string; text: string } | undefined> {
  try {
    // use apify to crawl the pages that diffbot cannot
    const res = await scrape(url);
    if (!res) {
      console.warn('BrightData scrape failed with url', url);
      return;
    }

    return processHtml(res, url);
  } catch (e: any) {
    console.warn('BrightData scrape errored with url', e.message, url);
    return;
  }
}
