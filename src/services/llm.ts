import {
  AnthropicChatApi,
  ChatRequestMessage,
  GroqChatApi,
  OpenAIChatApi,
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

export const sonnet = new AnthropicChatApi(
  { apiKey: process.env.ANTHROPIC_KEY },
  {
    model: 'claude-3-sonnet-20240229',
    stream: true,
    temperature: 0,
    contextSize: 160_000, // NOTE: anthropic is actually 200k, but do less because we're using the wrong tokenizer (tiktoken) to measure context size, and we don't want to pay too much for large context.
  },
);
export const sonnetCompletion: Completion = partial(completion, sonnet);
export const sonnetChat: Chat = partial(chat, sonnet);

export const haiku = new AnthropicChatApi(
  { apiKey: process.env.ANTHROPIC_KEY },
  {
    model: 'claude-3-haiku-20240307',
    stream: true,
    temperature: 0,
    contextSize: 160_000, // NOTE: anthropic is actually 200k, but do less because we're using the wrong tokenizer (tiktoken) to measure context size, and we don't want to pay too much for large context.
  },
);
export const haikuCompletion: Completion = partial(completion, haiku);
export const haikuChat: Chat = partial(chat, haiku);

export const opus = new AnthropicChatApi(
  { apiKey: process.env.ANTHROPIC_KEY },
  {
    model: 'claude-3-opus-20240229',
    stream: true,
    temperature: 0,
    contextSize: 160_000, // NOTE: anthropic is actually 200k, but do less because we're using the wrong tokenizer (tiktoken) to measure context size, and we don't want to pay too much for large context.
  },
);
export const opusCompletion: Completion = partial(completion, opus);
export const opusChat: Chat = partial(chat, opus);

export const mixtral = new GroqChatApi(
  { apiKey: process.env.GROQ_KEY! },
  {
    model: 'mixtral-8x7b-32768',
    stream: false,
    temperature: 0,
    contextSize: 32_000,
  },
);
export const mixtralCompletion: Completion = partial(completion, mixtral);
export const mixtralChat: Chat = partial(chat, mixtral);
