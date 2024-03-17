import { remove, uniqBy } from 'lodash';
import { z } from 'zod';

import { gpt3xlCompletion } from '@/services/llm';
import { UrlResult } from '@/registry/internet/extract';

const SystemPrompt = `You are an expert AI agent tasked with browsing and classifying websites. Follow the user's instructions exactly. Never say common misconceptions, outdated information, lies, fiction, myths, jokes, or memes. The user has an IQ of 200 and require expert level knowledge. Never write any information that is not in the original content.`;

const completion: typeof gpt3xlCompletion = (prompt, opt) =>
  gpt3xlCompletion(prompt, { ...opt, systemMessage: SystemPrompt });

export async function filterUrls(
  urlsToRank: UrlResult[],
  browsedUrls: UrlResult[],
  direction: string,
  browseLeft: number,
) {
  const schema = z.object({
    urls: z.array(
      z
        .object({
          index: z
            .number()
            .describe('The index of this URL in the urls array.'),
          reason: z
            .string()
            .describe(
              'State the reason why this URL meet the given criteria. Describe in one sentence in prose.',
            ),
          url: z
            .string()
            .describe('The url to browse according to the given criteria.'),
          relevance: z
            .number()
            .describe(
              'A number between 0 - 1 indicating the relevance of this URL based on the given criteria.',
            ),
        })
        .describe(
          `URLs to browse according to the given criteria, return ${browseLeft} URLs max.`,
        ),
    ),
  });

  const urlsToRankString = urlsToRank
    .map(l => `- [${l.reason}](${l.url})`)
    .join('\n');
  const browsedUrlsString = browsedUrls
    .map(l => `- [${l.reason}](${l.url})`)
    .join('\n');
  const res = await completion(
    `Given the list of input URLs, rank and return the most relevant ${browseLeft} URLs that I should browse in order to write a report on the following topic:\n${direction}\n\n# Instructions\nKeep in mind I can only browse ${browseLeft} more websites before I need to write the final report. The final report need to cover everything mentioned in the criteria, so only return the correct URLs that addresses any knowledge gaps I have, especially if there are things mentioned in the criteria that I have not browsed yet.\n\n# Input URLs\nReturn a new set of URLs taken from the following set of URLs that I've found:\n${urlsToRankString}${
      browsedUrls.length
        ? `\n\n# Already browsed URLs\nHere is a list of URLs that I've already browsed, avoid returning URLs that contain the same information as the URLs below. Do NOT return any URLs in this list:\n${browsedUrlsString}`
        : ''
    }`,
    {
      autoSlice: true,
      schema,
      minimumResponseTokens: 2000,
    },
  );

  const urls = uniqBy(res.data.urls, 'url');
  // do some filtering, since sometimes this model call will return some URLs that's already browsed
  remove(urls, l => browsedUrlsString.includes(l.url));
  // remove any urls that is not in the original list
  remove(urls, l => !urlsToRank.map(u => u.url).includes(l.url));
  return urls;
}
