import { format } from 'date-fns';
import { z } from 'zod';

import { gpt4TurboCompletion } from '@/services/llm';

const MaxQueries = 6;

export async function generateQueryQuestions({
  query,
  maxQueries = MaxQueries,
}: {
  query: string;
  maxQueries?: number;
}) {
  const systemMessage = () => {
    const now = new Date();
    const dateString = format(now, 'MMMM do, yyyy');
    return `You are an expert research AI agent with an IQ of 200, who graduated from Harvard and is a partner at McKinsey. Today is ${dateString}. You may be asked to research subjects that is after your knowledge cutoff, assume the human is right when presented with news. The researcher that will answer these questions has access to a computer that can do calculations and browse the internet.`;
  };

  const res = await gpt4TurboCompletion(
    `Break down the following prompt into multiple specific search queries that can be researched separately. Word the queries in way that it can be used as a Google search query. Keep the list to be under ${maxQueries} queries. If the prompt is straightforward, just return one query. The results from these queries will be combined in order to form a fully fleshed out report.\n\nIf the prompt cannot be researched, simply respond with an empty array.\n\nPrompt:\n${query}`,
    {
      autoSlice: true,
      systemMessage,
      minimumResponseTokens: 500,
      schema: z.object({
        objective: z
          .string()
          .describe(
            'What is a good title for the final report that answers this prompt?',
          ),
        queries: z
          .array(
            z
              .string()
              .describe(
                'The Google query to search for. You can use the site: syntax to focus on specific sources.',
              ),
          )
          .describe(
            `List of up to ${maxQueries} to search for on Google, taking into account the questions generated.`,
          ),
      }),
    },
  );

  return res.data;
}
