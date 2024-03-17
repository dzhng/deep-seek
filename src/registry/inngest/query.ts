import { createResearchPlan } from '@/registry/agent/planner';
import { preprocessPrompt } from '@/registry/agent/preprocessor';
import { invokeTool } from '@/registry/agent/tools';
import { inngest } from '@/registry/inngest/client';

export const run = inngest.createFunction(
  { id: 'run-query', name: 'Run query' },
  { event: 'app/query.run' },
  async ({ event, step }) => {
    console.info('Running query', event.data.prompt);

    /*const preprocessed = await step.run('preprocess-prompt', async () =>
      preprocessPrompt({ userPrompt: event.data.prompt }),
    );*/

    await step.run('run', async () => {
      let plan = await createResearchPlan({ objective: event.data.prompt });
      for (let i = 0; i < 20; i++) {
        if (
          plan.data.tool.name === 'finish' ||
          plan.data.tool.name === 'error'
        ) {
          console.log('PLANNER FINISHED', plan.data.tool.parameters);
          return;
        }

        const params = await invokeTool(plan.data.tool as any);
        if (params) {
          plan = await plan.respond(params);
        } else {
          console.error('ERROR INVOKING TOOL');
          return;
        }
      }
    });
  },
);
