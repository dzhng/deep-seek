import Metaphor from 'metaphor-node';

import { browse } from '@/registry/internet/processor/browse';

const metaphor = new Metaphor(process.env.METAPHOR_API_KEY ?? '');

export type AgentToolName = 'browse' | 'search';

export async function invokeTool({
  name,
  parameters,
}: {
  name: AgentToolName;
  parameters: { name: string; value: string | number }[];
}) {
  if (name === 'browse') {
    const url = parameters.find(p => p.name === 'url')?.value;
    if (!url || typeof url !== 'string') {
      return;
    }
    const res = await browse({ url });
    return res?.content;
  } else if (name === 'search') {
    const query = parameters.find(p => p.name === 'query')?.value;
    if (!query || typeof query !== 'string') {
      return;
    }
    const res = await metaphor.search(query, {
      type: 'keyword',
      useAutoprompt: true,
      numResults: 10,
    });
    return;
  }
}
