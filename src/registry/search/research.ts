import { EventEmitter } from 'stream';
import { format } from 'date-fns';
import { z } from 'zod';
import { RecursiveCharacterTextSplitter } from 'zod-gpt';

import { BrowseResults } from '@/services/browse';
import { gpt4TurboCompletion, sonnetCompletion } from '@/services/llm';
import { MaxContentLength } from '@/lib/const';

const MaxQuestions = 6;
const MaxQueries = 10;

export async function generateQueryQuestions(query: string) {
  const systemMessage = () => {
    const now = new Date();
    const dateString = format(now, 'MMMM do, yyyy');
    return `You are an expert research AI agent with an IQ of 200, who graduated from Harvard and is a partner at McKinsey. Today is ${dateString}. You may be asked to research subjects that is after your knowledge cutoff, assume the human is right when presented with news. The researcher that will answer these questions has access to a computer that can do calculations and browse the internet.`;
  };

  const res = await gpt4TurboCompletion(
    `Break down the following prompt into multiple specific questions that can be researched separately. Each item in the list should be an independent question, as they will be researched by separate people who don't know what the other questions are. Word the question in way that it can be used as a Google search query. Keep the list to be under ${MaxQuestions} key questions. If the prompt is straightforward, just return one question. The results from these questions will be combined in order to form a fully fleshed out report.\n\nIf the prompt cannot be researched, simply respond with an empty array.\n\nPrompt:\n${query}`,
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
        questions: z
          .array(z.string().describe('The question to ask.'))
          .describe(`List of questions, up to ${MaxQuestions} max`),
        queries: z
          .array(
            z
              .string()
              .describe(
                'The Google query to search for. You can use the site: syntax to focus on specific sources.',
              ),
          )
          .describe(
            `List of up to ${MaxQueries} to search for on Google, taking into account the questions generated.`,
          ),
      }),
    },
  );

  return res.data;
}

export async function generateAnswer(
  objective: string,
  plan: string[],
  contents: BrowseResults[],
  events?: EventEmitter,
): Promise<string> {
  const textSplitter = new RecursiveCharacterTextSplitter({
    chunkSize: MaxContentLength,
  });
  const documentsString = contents
    .map(
      (content, idx) =>
        `<document reference="${
          idx + 1
        }">\n<source>\n${content.url.trim()}\n</source>\n${
          content.title ? `<title>\n${content.title.trim()}\n</title>\n` : ''
        }<content>\n${textSplitter
          .splitText(content.content)[0]
          ?.trim()}\n</content>\n</document>`,
    )
    .join('\n');

  const systemMessage = () => {
    const now = new Date();
    const dateString = format(now, 'MMMM do, yyyy');
    return `Here are a list of sources for you to reference for your task:\n\n<documents>\n${documentsString}\n</documents>\n\nYou are an expert information processing AI agent with an IQ of 200. Today is ${dateString}. You produce well articulated reports with guidance from the content given to you in context. The human you are creating the report for has an IQ of 200 and expects full details. Follow the human's request to the letter. Be as truthful as possible, and produce the correct data in your report.`;
  };

  const res = await sonnetCompletion(
    `Write a market research report at the level of an expert McKinsey analyst with the following objective:\n${objective}\n\n- When writing the report, think through the objective step by step and use the context you are given to reach the correct conclusion.\n- The key takeaways should be in the first paragraph.\n- Make sure to explain how you reached the conclusion in detail.\n- Use the information from the context as data to include in the report. Also add any additional information that the context missed.\n- Make sure the report is as detailed as possible and is at least 2 pages.\n- Try to divide the report into multiple sections so it is easy to read. Write in prose. Within each section, explain key data and statistics and data in bullet points, with citations.\n- All reports must be written in Markdown format.\n- ALWAYS include citations to the given content when possible. The citation included in the content should reference the reference number attached to each content.\n- ALWAYS cite which content any data or statistics came from.\n- Write citations in this custom format: \`[[1]]\`. Multiple citations should be written as: \`[[1]][[2]]\`. The number is the reference number of the source.\n- Do NOT include a references or sources section at the end of the report.\n\nTry to address the following questions when writing the report:\n- ${plan.join(
      '\n- ',
    )}`,
    {
      autoSlice: true,
      systemMessage,
      minimumResponseTokens: 2000,
      // steer the model to generate a level 1 heading as first line via prefix
      responsePrefix: `# ${objective}\n\n## Key Takeaways`,
      events,
    },
  );

  return res.data;
}
