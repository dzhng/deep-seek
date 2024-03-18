import { z } from 'zod';

import { BrowseResults } from '@/services/browse';
import { gpt3xlCompletion } from '@/services/llm';
import { splitSentence } from '@/lib/sentence-splitter';

export type ContentResult = {
  reason: string;
  text: string;
};

const SystemPrompt = `You are an expert AI agent tasked with browsing and classifying websites. Follow the user's instructions exactly. Never say common misconceptions, outdated information, lies, fiction, myths, jokes, or memes. The user has an IQ of 200 and require expert level knowledge. Never write any information that is not in the original content.`;

const completion: typeof gpt3xlCompletion = (prompt, opt) =>
  gpt3xlCompletion(prompt, { ...opt, systemMessage: SystemPrompt });

// insert markers into the page content for the llm to use as anchor for text extraction
export function processContent(content: string): string {
  const lines = content.split('\n');
  let markerIndex = 2;
  const processed = lines.map(line => {
    if (!line) {
      return '';
    }

    const sentences = splitSentence(line, 16);
    // add marker at beginning of line, then at end of each sentence.
    return sentences.map(s => `${s}<m>${markerIndex++}</m>`).join(' ');
  });
  return `<m>1</m>${processed.join('\n')}`;
}

export async function extractContent({
  page,
  query,
}: {
  page: BrowseResults;
  query: string;
}): Promise<ContentResult[]> {
  const { data } = await completion(
    `Given the following page content, extract any relevant text from the page that answer the following query:\n${query}\n\nMake sure to return text that ONLY relevant for the query. Don't respond with any text that is not on the given page.\nThe title of the page is:\n${page.title}\n\nPage content to extract:\n\`\`\`\n${processed.content}\n\`\`\``,
    {
      schema: z.object({}),
      autoSlice: true,
      minimumResponseTokens: 2000,
    },
  );
}
