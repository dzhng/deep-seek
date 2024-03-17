import { ApifyClient } from '@/services/apify';
import { minifyText, normalizeMarkdownHeadings } from '@/lib/format';

const apify = new ApifyClient();

export async function processWebpageWithApify(
  url: string,
): Promise<{ title: string; text: string } | undefined> {
  try {
    // use apify to crawl the pages that diffbot cannot
    const res = await apify.crawl(url);
    if (!res) {
      return;
    }

    return {
      title: res.metadata.title,
      // cleanup and normalize page a bit since the output from apify tends to be messy
      text: normalizeMarkdownHeadings(minifyText(res.markdown)),
    };
  } catch (e: any) {
    console.warn('Apyfy scrape errored with url', e.message, url);
    return;
  }
}
