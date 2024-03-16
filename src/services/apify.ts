import defaultKy from 'ky';
import pThrottle from 'p-throttle';

import { throttleKy } from '@/lib/utils';

type CrawlData = {
  loadedUrl: string;
  loadedTime: string;
  referrerUrl: string;
  depth: number;
  httpStatusCode: number;
};

type Metadata = {
  canonicalUrl: string;
  title: string;
  description?: string | null;
  author?: string | null;
  keywords?: string[] | null;
  languageCode?: string | null;
};

type WebpageData = {
  url: string;
  crawl: CrawlData;
  metadata: Metadata;
  screenshotUrl: string | null;
  text: string;
  markdown: string;
};

type SerpData = {
  url: string;
  resultsTotal: number;
  searchQuery: unknown;
  relatedQueries: unknown;
  peopleAlsoAsk: SerpAlsoAskResult[];
  paidResults: SerpResult[];
  paidProducts: SerpResult[];
  organicResults: SerpResult[];
};

type SerpAlsoAskResult = {
  question: string;
  answer: string;
  url: string;
  title: string;
};

type SerpResult = {
  title: string;
  url: string;
  description: string;
  date: string;
};

const runCrawlUrl = (token: string) =>
  `https://api.apify.com/v2/actor-tasks/dzhng~website-content-crawler-task/run-sync-get-dataset-items?token=${token}`;

const runSerpUrl = (token: string) =>
  `https://api.apify.com/v2/actor-tasks/dzhng~google-search-results-scraper-task/run-sync-get-dataset-items?token=${token}`;

const throttle = pThrottle({
  limit: 20,
  interval: 60 * 1000,
  strict: true,
});

export class ApifyClient {
  api: typeof defaultKy;

  apiKey: string;

  constructor({
    apiKey = process.env.APIFY_KEY!,
    timeoutMs = 300_000,
    ky = defaultKy,
  }: {
    apiKey?: string;
    timeoutMs?: number;
    ky?: typeof defaultKy;
  } = {}) {
    if (!apiKey) {
      throw new Error(`Error ApifyClient missing required "apiKey"`);
    }

    this.apiKey = apiKey;
    const throttledKy = throttleKy(ky, throttle);
    this.api = throttledKy.extend({
      timeout: timeoutMs,
    });
  }

  async crawl(url: string) {
    return (
      await this.api
        .post(runCrawlUrl(this.apiKey), {
          body: JSON.stringify({
            startUrls: [{ url }],
          }),
          headers: {
            'Content-Type': 'application/json',
          },
        })
        .json<WebpageData[]>()
    )[0];
  }

  async serp(query: string) {
    return (
      await this.api
        .post(runSerpUrl(this.apiKey), {
          body: JSON.stringify({
            queries: query,
          }),
          headers: {
            'Content-Type': 'application/json',
          },
        })
        .json<SerpData[]>()
    )[0];
  }
}
