import { z } from 'zod';

import { haikuCompletion } from '@/services/llm';
import { ContentResult } from '@/registry/internet/extract-content';

const SystemPrompt = `You are an expert AI agent tasked with browsing and classifying websites. Follow the user's instructions exactly. Never say common misconceptions, outdated information, lies, fiction, myths, jokes, or memes. The user has an IQ of 200 and require expert level knowledge. Never write any information that is not in the original content.`;

const completion: typeof haikuCompletion = (prompt, opt) =>
  haikuCompletion(prompt, { ...opt, systemMessage: SystemPrompt });

export async function aggregateContent({
  content,
  query,
}: {
  content: ContentResult[];
  query: string;
}): Promise<{ answer: string; sources: number[]; confidence: number }> {
  const { data } = await completion(
    `Given the following nodes of a knowledge graph, return the answer to the following query:\n<query>${query}</query>\n\n<nodes>\n${content.map((r, idx) => `<node id="${idx}">\n<title>${r.title}</title>\n<content>\n${r.text}\n</content>\n</node>`).join('\n')}\n</nodes>`,
    {
      schema: z.object({
        answer: z
          .string()
          .describe(
            'Answer to the query, keep it to one paragraph max. If the answer is not in the provided content and you don\'t know the answer, simply say "I don\'t know"',
          ),
        sources: z
          .string()
          .array()
          .describe('Node id of the sources used in this answer'),
        confidence: z
          .number()
          .describe(
            'How confident are you in this answer, from 0 - 10. If the answer is directly from source, return 10. If sources conflict, return 7, if there are no information found in the source but you know the answer, return 5 or lower depending on your level of confidence.',
          ),
      }),
      autoSlice: true,
      minimumResponseTokens: 2000,
    },
  );

  return {
    ...data,
    // make sure confidence is on a 0-1 scale
    confidence: data.confidence / 10,
    sources: data.sources.map(Number),
  };
}
