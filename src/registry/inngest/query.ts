import { createResearchPlan } from '@/registry/agent/planner';
import { preprocessPrompt } from '@/registry/agent/preprocessor';
import { invokeTool } from '@/registry/agent/tools';
import { inngest } from '@/registry/inngest/client';

export const run = inngest.createFunction(
  { id: 'run-query', name: 'Run query' },
  { event: 'app/query.run' },
  async ({ event, step }) => {
    console.info('Running query', event.data.prompt);

    const preprocessed = await step.run('preprocess-prompt', async () =>
      preprocessPrompt({ userPrompt: event.data.prompt }),
    );

    const tool = await step.run('choose-tool', async () =>
      createResearchPlan({ objective: event.data.prompt }),
    );

    const toolRes = await step.run('invoke-tool', async () =>
      invokeTool(tool.tool as any),
    );
  },
);
