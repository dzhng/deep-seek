import { AnthropicChatApi, ChatRequestMessage } from 'llm-api';
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
