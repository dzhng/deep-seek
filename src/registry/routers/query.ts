import { flatten } from 'lodash';
import pall from 'p-all';
import { z } from 'zod';

import { protectedProcedure, router } from '@/lib/trpc/server';
import { enrichCell } from '@/registry/agent/enrich';
import {
  preprocessNeuralPrompt,
  preprocessPrompt,
} from '@/registry/agent/preprocessor';
import { browse } from '@/registry/search/browse';
import { retrieve } from '@/registry/search/retrieve';
import { search } from '@/registry/search/search';
import { TableCell } from '@/registry/types';

export const queryRouter = router({
  run: protectedProcedure
    .input(
      z.object({
        prompt: z.string().trim(),
      }),
    )
    .mutation(async ({ input }) => {
      const [preprocessed, neuralPrompt] = await Promise.all([
        preprocessPrompt({ userPrompt: input.prompt }),
        preprocessNeuralPrompt({
          userPrompt: input.prompt,
        }),
      ]);
      console.log('Preprocessed', neuralPrompt, preprocessed);

      // run both a neural search and keyword search in parallel, they'll pick up different results
      const results = flatten(
        await Promise.all([
          search({
            query: input.prompt,
            numResults: 5,
            startPublishDate: preprocessed.startDate,
          }),
          search({
            query: neuralPrompt,
            isNeural: true,
            // using our own autoprompt implementation for better perf
            useAutoprompt: false,
            numResults: 10,
            startPublishDate: preprocessed.startDate,
          }),
        ]),
      );
      const browseRes = await browse({ results });

      const nodeType = `${preprocessed.entity.name} - ${preprocessed.entity.description}`;
      const retrieveRes = await retrieve({
        results: browseRes,
        nodeType,
      });
      console.log(`Retrieved ${retrieveRes.length} entities, enriching...`);

      const promises: (() => Promise<TableCell | undefined>)[] = [];

      // retrieve all other cells async
      for (let row = 0; row < retrieveRes.length; row++) {
        for (let column = 0; column < preprocessed.columns.length; column++) {
          const field = preprocessed.columns[column];
          promises.push(async () => {
            const cell = await enrichCell({
              query: `${retrieveRes[row].title} - ${field.name} - ${field.description}`,
              content: [retrieveRes[row]],
            }).catch(e => {
              // ignore any errors in enrich, just skip that cell
              console.error('Error enriching cell', e);
              return undefined;
            });
            console.log('Enriched cell', cell);
            return cell;
          });
        }
      }

      const cells = await pall(promises, {
        concurrency: 10,
      });

      console.log('Finished processing');

      const table: (TableCell | undefined)[][] = Array(retrieveRes.length)
        .fill(undefined)
        // add an extra column for the initial value
        .map(() => Array(preprocessed.columns.length + 1).fill(undefined));

      // construct the table from outputs
      for (let row = 0; row < retrieveRes.length; row++) {
        const cell: TableCell = {
          text: retrieveRes[row].title,
          confidence: 1,
          sources: retrieveRes[row].sources,
        };
        table[row][0] = cell;
        for (let column = 0; column < preprocessed.columns.length; column++) {
          table[row][column + 1] =
            cells[row * preprocessed.columns.length + column];
        }
      }

      return {
        columns: [preprocessed.entity, ...preprocessed.columns],
        table,
      };
    }),
});
