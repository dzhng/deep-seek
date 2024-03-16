import {
  AnthropicBedrockChatApi,
  AnthropicChatApi,
  ChatRequestMessage,
  OpenAIChatApi,
  TokenError,
} from 'llm-api';
import { partial } from 'lodash';
import { z } from 'zod';
import { chat, completion, RequestOptions, Response } from 'zod-gpt';

type Completion = <T extends z.ZodType = z.ZodString>(
  prompt: string | (() => string),
  opt?: Partial<RequestOptions<T>>,
) => Promise<Response<T>>;

type Chat = <T extends z.ZodType = z.ZodString>(
  messages: ChatRequestMessage[],
  opt?: Partial<RequestOptions<T>>,
) => Promise<Response<T>>;

export const gpt3 = new OpenAIChatApi(
  {
    apiKey: process.env.AZURE_OPENAI_KEY!,
    azureEndpoint: process.env.AZURE_OPENAI_ENDPOINT,
    azureDeployment: 'gpt-35',
  },
  { temperature: 0, contextSize: 4096 },
);
export const gpt3Completion: Completion = partial(completion, gpt3);
export const gpt3Chat: Chat = partial(chat, gpt3);

export const gpt3xl = new OpenAIChatApi(
  {
    apiKey: process.env.AZURE_OPENAI_KEY!,
    azureEndpoint: process.env.AZURE_OPENAI_ENDPOINT,
    azureDeployment: 'gpt-35-16k',
  },
  { temperature: 0, contextSize: 16_000 },
);
export const gpt3xlCompletion: Completion = partial(completion, gpt3xl);
export const gpt3xlChat: Chat = partial(chat, gpt3xl);

export const gpt4 = new OpenAIChatApi(
  {
    apiKey: process.env.AZURE_OPENAI_KEY!,
    azureEndpoint: process.env.AZURE_OPENAI_ENDPOINT,
    azureDeployment: 'gpt-4',
  },
  { temperature: 0, contextSize: 8129 },
);
export const gpt4Completion: Completion = partial(completion, gpt4);
export const gpt4Chat: Chat = partial(chat, gpt4);

export const gpt4xl = new OpenAIChatApi(
  {
    apiKey: process.env.AZURE_OPENAI_KEY!,
    azureEndpoint: process.env.AZURE_OPENAI_ENDPOINT,
    azureDeployment: 'gpt-4-32k',
  },
  { temperature: 0, contextSize: 32_000 },
);
export const gpt4xlCompletion: Completion = partial(completion, gpt4xl);
export const gpt4xlChat: Chat = partial(chat, gpt4xl);

export const gpt4turbo = new OpenAIChatApi(
  {
    apiKey: process.env.AZURE_OPENAI_KEY!,
    azureEndpoint: process.env.AZURE_OPENAI_ENDPOINT,
    azureDeployment: 'gpt-4-128k',
  },
  // context size is technically 127793 tokens, but leave some room for margins
  { temperature: 0, contextSize: 120_000, stream: true },
);
export const gpt4TurboCompletion: Completion = partial(completion, gpt4turbo);
export const gpt4TurboChat: Chat = partial(chat, gpt4turbo);

export const anthropic = new AnthropicChatApi(
  {
    apiKey: process.env.ANTHROPIC_KEY!,
  },
  {
    model: 'claude-3-sonnet-20240229',
    stream: true,
    temperature: 0,
    contextSize: 120_000, // NOTE: anthropic is actually 200k, but do less because we're using the wrong tokenizer (tiktoken) to measure context size, and we don't want to pay too much for large context.
  },
);
export const anthropicCompletion: Completion = partial(completion, anthropic);
export const anthropicChat: Chat = partial(chat, anthropic);

export const bedrock = new AnthropicBedrockChatApi(
  {
    accessKeyId: process.env.AWS_BEDROCK_ACCESS_KEY!,
    secretAccessKey: process.env.AWS_BEDROCK_SECRET_KEY!,
  },
  {
    model: 'anthropic.claude-v2:1',
    stream: true,
    temperature: 0,
    contextSize: 120_000,
  },
);
export const bedrockCompletion: Completion = partial(completion, bedrock);
export const bedrockChat: Chat = partial(chat, bedrock);

// first try the smaller model without autoSlice, then try the large model if token error was found
// switch between using openai's gpt3 and azure based on if a schema is provided or not
export const gpt3DynamicCompletion: Completion = (prompt, opt) =>
  gpt3Completion(prompt, {
    ...opt,
    autoSlice: false,
  }).catch(e => {
    if (e instanceof TokenError) {
      console.info('Completion overflow for gpt-3, falling back to xl model');
      return gpt3xlCompletion(prompt, {
        ...opt,
        // add long timeout for the xl model
        timeout: 300_000,
      });
    } else {
      throw e;
    }
  });

export const gpt4DynamicCompletion: Completion = (prompt, opt) =>
  gpt4Completion(prompt, {
    ...opt,
    autoSlice: false,
  }).catch(e => {
    if (e instanceof TokenError) {
      console.info('Completion overflow for gpt-4, falling back to xl model');
      return gpt4xlCompletion(prompt, {
        ...opt,
        // add long timeout for the xl model
        timeout: 300_000,
      });
    } else {
      throw e;
    }
  });
