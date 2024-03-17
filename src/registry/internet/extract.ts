import { compact, uniqBy } from 'lodash';
import { z } from 'zod';

import { gpt3xlCompletion } from '@/services/llm';
import { ensureAbsolute } from '@/lib/url';
import { BrowseResults } from '@/registry/internet/browse';

export type UrlResult = {
  reason: string;
  url: string;
  relevance: number;
};

const MaxUrlsToExtract = 10;

const SystemPrompt = `You are an expert AI agent tasked with browsing and classifying websites. Follow the user's instructions exactly. Never say common misconceptions, outdated information, lies, fiction, myths, jokes, or memes. The user has an IQ of 200 and require expert level knowledge. Never write any information that is not in the original content.`;

const ReturnSchema = z.object({
  urls: z
    .object({
      reason: z
        .string()
        .describe(
          'State the reason why this URL meet the given criteria. Describe in one sentence in prose.',
        ),
      url: z
        .string()
        .describe(
          "The url to extract according to the given criteria. DON't include privacy policy, terms of service, site map, or ads.",
        ),
      relevance: z
        .number()
        .describe(
          'A number between 0 - 1 indicating the relevance of this URL based on the given criteria.',
        ),
    })
    .array()
    .describe(
      `URLs to extract according to the given criteria. Follow URL extraction instructions. Extract a maximum of ${MaxUrlsToExtract} of the most relevant URLs.`,
    ),
});

const completion: typeof gpt3xlCompletion = (prompt, opt) =>
  gpt3xlCompletion(prompt, { ...opt, systemMessage: SystemPrompt });

function processUrls(content: string): {
  content: string;
  originalUrls: string[];
} {
  const regex = /\]\((http[s]?:\/\/[^\s]+|\/[^\s]*)\)/g;
  const originalUrls: string[] = [];

  let match: RegExpExecArray | null = null;
  while ((match = regex.exec(content)) !== null) {
    originalUrls.push(match[1]);
  }

  // replace all the urls found with a much smaller index, so it's easy for llm to return
  const processed = originalUrls.reduce((curContent, url, idx) => {
    return curContent.replace(`](${url})`, `](/${idx})`);
  }, content);

  return { content: processed, originalUrls };
}

function cleanUpExtractedUrls(
  urls: UrlResult[],
  originalUrls: string[],
  originalText: string,
  baseUrl: string,
): UrlResult[] {
  const processedToOriginal = compact(
    urls.map(u => {
      const idx = Number(u.url.replace('/', '').trim());
      if (idx >= 0) {
        const originalUrl = originalUrls[idx];
        return { ...u, url: ensureAbsolute(originalUrl, baseUrl) };
      } else {
        // if it's not in the url list, it may not be from a href tag, try to find it in original html to make sure it truly is there
        if (originalText.includes(u.url)) {
          return { ...u, url: ensureAbsolute(u.url, baseUrl) };
        } else {
          return undefined;
        }
      }
    }),
  ).filter(
    u =>
      !(
        u.url === '/' ||
        u.url === baseUrl ||
        u.url.includes('#') ||
        u.url.includes('@') ||
        u.url.startsWith('javascript') ||
        u.url.startsWith('/')
      ),
  );

  return uniqBy(processedToOriginal, u => u.url);
}

export async function extractUrls({
  n = MaxUrlsToExtract,
  page,
  url,
  direction,
}: {
  n?: number;
  page: BrowseResults;
  url: string;
  direction: string;
}): Promise<UrlResult[]> {
  const processed = processUrls(page.content);

  const { data } = await completion(
    `Given the following page content, extract any relevant urls from the page that meets the following criteria:\n${direction}\n\nMake sure to return URLs that matches the criteria exactly. It's better to return less URLs that are more relevant than more URLs. Extract a MAXIMUM of ${n} relevant URLs. Don't include any URLs that is related to a user action (e.g. creating, deleting, replying, hiding.. etc), it should only be URLs that lead to additional content. Only respond with valid URLs, no empty or null URLs. Don't respond with any URLs that is not on the given page. The URLs returned should be written in the exact way as the original content (e.g. in the href tag).\nThe title of the page is:\n${page.title}\n\nPage content to extract:\n\`\`\`\n${processed.content}\n\`\`\``,
    {
      schema: ReturnSchema,
      autoSlice: true,
      minimumResponseTokens: 2000,
    },
  );

  return cleanUpExtractedUrls(
    data.urls as UrlResult[],
    processed.originalUrls,
    page.content,
    url,
  );
}
