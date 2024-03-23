import { z } from 'zod';

import { haikuCompletion } from '@/services/llm';
import { ContentResultWithSources } from '@/registry/types';

const SystemPrompt = `You are an expert AI agent tasked with browsing and classifying websites. Follow the user's instructions exactly. Never say common misconceptions, outdated information, lies, fiction, myths, jokes, or memes. The user has an IQ of 200 and require expert level knowledge. Never write any information that is not in the original content.`;

const completion: typeof haikuCompletion = (prompt, opt) =>
  haikuCompletion(prompt, { ...opt, systemMessage: SystemPrompt });

export async function filterContent({
  content,
  nodeType,
}: {
  content: ContentResultWithSources[];
  nodeType: string;
}): Promise<ContentResultWithSources[]> {
  const { data } = await completion(
    `Given the following nodes of a knowledge graph, find any nodes that is NOT of the following type that we can filter out to keep the graph clean:\n<type>${nodeType}</type>\n\n<nodes>\n${content.map((r, idx) => `<node id="${idx}">\n<name>${r.title}</name>\n<description>${r.reason}</description>\n</node>`).join('\n')}\n</nodes>`,
    {
      schema: z.object({
        nodeIds: z
          .string()
          .array()
          .describe('The list of node ids to filter out.'),
      }),
      autoSlice: true,
      minimumResponseTokens: 2000,
    },
  );

  const filteredContent = content.filter(
    (_, idx) => !data.nodeIds.includes(String(idx)),
  );
  return filteredContent;
}
