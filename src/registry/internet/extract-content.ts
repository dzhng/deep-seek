import { flatten } from 'lodash';
import { z } from 'zod';

import { BrowseResults } from '@/services/browse';
import { gpt3xlCompletion } from '@/services/llm';
import { splitSentence } from '@/lib/sentence-splitter';

export type ContentResult = {
  reason: string;
  title: string;
  text: string;
};

const SystemPrompt = `You are an expert AI agent tasked with browsing and classifying websites. Follow the user's instructions exactly. Never say common misconceptions, outdated information, lies, fiction, myths, jokes, or memes. The user has an IQ of 200 and require expert level knowledge. Never write any information that is not in the original content.`;

const completion: typeof gpt3xlCompletion = (prompt, opt) =>
  gpt3xlCompletion(prompt, { ...opt, systemMessage: SystemPrompt });

// insert markers into the page content for the llm to use as anchor for text extraction
export function processContent(content: string): {
  content: string;
  sentences: string[];
} {
  const lines = content.split('\n');
  let markerIndex = 2;

  const processed = lines.map(line => {
    if (!line) {
      return { content: '', sentences: [] };
    }

    const sentences = splitSentence(line, 16);
    // add marker at beginning of line, then at end of each sentence.
    return {
      content: sentences.map(s => `${s}<m>${markerIndex++}</m>`).join(' '),
      sentences,
    };
  });

  return {
    content: `<m>1</m>${processed.map(p => p.content).join('\n')}`,
    sentences: flatten(
      processed.map(p =>
        p.sentences.map(
          (s, idx) => s + (idx === p.sentences.length - 1 ? '\n' : ' '),
        ),
      ),
    ),
  };
}

export async function extractContent({
  page,
  query,
}: {
  page: BrowseResults;
  query: string;
}): Promise<ContentResult[]> {
  const processed = processContent(page.content);
  const { data } = await completion(
    `Given the following page content, extract any relevant text from the page that answer the following query:\n${query}\n\nThe page will be marked by markers that looks like this: <m>1</m>, select the text in between 2 markers to extract it. Extract as much text as possible, make sure there's enough context that the text extracted makes sense on its own.\nThe title of the page is:\n${page.title}\n\nPage content to extract:\n\`\`\`\n${processed.content}\n\`\`\``,
    {
      schema: z.object({
        markers: z
          .object({
            reason: z.string().describe('Describe why this text is selected.'),
            title: z
              .string()
              .describe('Give a short title to the text being selected.'),
            from: z.number().describe('The initial marker id to start from.'),
            to: z.number().describe('The marker id to end selection at.'),
          })
          .array()
          .describe('Markers to select to extract the text.'),
      }),
      autoSlice: true,
      minimumResponseTokens: 2000,
    },
  );

  return data.markers.map(marker => ({
    reason: marker.reason,
    title: marker.title,
    text: processed.sentences
      .slice(marker.from - 1, marker.to - 1)
      .join('')
      .trim(),
  }));
}
