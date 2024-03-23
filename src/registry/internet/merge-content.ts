import { flatten } from 'lodash';
import { z } from 'zod';

import { haikuCompletion } from '@/services/llm';
import { ContentResultWithSources } from '@/registry/types';

const SystemPrompt = `You are an expert AI agent tasked with browsing and classifying websites. Follow the user's instructions exactly. Never say common misconceptions, outdated information, lies, fiction, myths, jokes, or memes. The user has an IQ of 200 and require expert level knowledge. Never write any information that is not in the original content.`;

const completion: typeof haikuCompletion = (prompt, opt) =>
  haikuCompletion(prompt, { ...opt, systemMessage: SystemPrompt });

export async function mergeContent({
  content,
  nodeType,
}: {
  content: ContentResultWithSources[];
  nodeType: string;
}): Promise<ContentResultWithSources[]> {
  const { data } = await completion(
    `Given the following nodes of a knowledge graph, find any knowledge graph nodes of the same entity and combine them. Just return nodes that needs to be combined. The nodes are of the following type:\n<type>${nodeType}</type>\n\n<nodes>\n${content.map((r, idx) => `<node id="${idx}">\n<name>${r.title}</name>\n<description>${r.reason}</description>\n</node>`).join('\n')}\n</nodes>`,
    {
      schema: z.object({
        nodesToMerge: z
          .object({
            reason: z.string().describe('Why these nodes should be merged.'),
            title: z.string().describe('A new title for the merged nodes.'),
            nodeIds: z
              .string()
              .array()
              .describe('The list of node ids to merge into one node.'),
          })
          .array()
          .describe(
            'Nodes that should be merged together because they are the same entity.',
          ),
      }),
      autoSlice: true,
      minimumResponseTokens: 2000,
    },
  );

  const mergedContent: ContentResultWithSources[] = [];
  for (const node of data.nodesToMerge) {
    const mergedNode = {
      reason: node.reason,
      title: node.title,
      text: node.nodeIds.map(id => content[Number(id)].text).join('\n---\n'),
      sources: flatten(node.nodeIds.map(id => content[Number(id)].sources)),
    };
    mergedContent.push(mergedNode);
  }

  const mergedNodeIds = data.nodesToMerge.flatMap(node =>
    node.nodeIds.map(id => Number(id)),
  );
  const unmergedContent = content.filter(
    (_, idx) => !mergedNodeIds.includes(idx),
  );
  return [...mergedContent, ...unmergedContent];
}
