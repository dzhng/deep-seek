import { z } from 'zod';

import { sonnetCompletion } from '@/services/llm';
import { ContentResult } from '@/registry/types';

const SystemPrompt = `You are an expert AI agent tasked with browsing and classifying websites. Follow the user's instructions exactly. Never say common misconceptions, outdated information, lies, fiction, myths, jokes, or memes. The user has an IQ of 200 and require expert level knowledge. Never write any information that is not in the original content.`;

export async function aggregateContent({
  query,
  content,
}: {
  query: string;
  content: ContentResult[];
}): Promise<{ answer?: string; sources: number[]; confidence: number }> {
  const { data } = await sonnetCompletion(
    `Based on the sources given, return the answer to the following query:\n<query>${query}</query>`,
    {
      systemMessage: `Here is a list of sources for you to reference for your task:\n\n<documents>\n${content.map((r, idx) => `<document id="${idx}">\n<title>${r.title}</title>\n<content>\n${r.text}\n</content>\n</document>`).join('\n')}\n</documents>\n\n${SystemPrompt}`,
      schema: z.object({
        answer: z
          .string()
          .nullish()
          .describe(
            'Answer to the query based on the given sources. Keep it to one paragraph max. ONLY return if the answer is found in the provided content. Return just the answer, no prose',
          ),
        sources: z
          .string()
          .array()
          .describe(
            'Id of the sources used in this answer, return empty array if no answer is found.',
          ),
        guess: z
          .string()
          .nullish()
          .describe(
            "Your best guess as to what the answer is based on your understanding of the world. It doesn't matter that it is not in the content given, just give a direct guess, the user will know that it is a guess. ONLY return this if you could not find the answer in the given content. Return just the answer, no prose. If you don't have a guess, don't return anything.",
          ),
        confidence: z
          .number()
          .describe(
            "How confident are you in this answer, from 0 - 10. If the answer is directly from the source, return 10. If there are conflicting information in different sources, return 5. If there are no answer but you have an educated guess, return 3. If you don't have a guess, return 0",
          ),
      }),
      autoSlice: true,
      minimumResponseTokens: 2000,
    },
  );

  return {
    answer: data.answer ?? data.guess ?? undefined,
    // make sure confidence is on a 0-1 scale
    confidence: data.confidence / 10,
    sources: data.sources.map(Number),
  };
}
