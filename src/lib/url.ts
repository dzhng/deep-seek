import normalizeUrlImpl, { type Options } from 'normalize-url';
import tlds from 'tlds';
import { z } from 'zod';

/**
 * Checks if url is valid and return the absolute version of url according to base
 * Throws error if not a valid url
 */
export function ensureAbsolute(url: string, base: string): string {
  return normalizeUrl(new URL(url, base).href);
}

/**
 * Normalizes a URL string.
 * Throws error if invalid url
 *
 * @param url - URL string to normalize
 * @param options - options for normalization.
 * @returns normalized URL string
 */
export function normalizeUrl(url: string, options?: Options): string {
  const opts = {
    stripWWW: true,
    defaultProtocol: 'http',
    normalizeProtocol: true,
    stripAuthentication: true,
    // NOTE: we want to default to http, because some company websites don't work if you just go straight to https. E.g. https://tiffany.com won't work, but the http version redirect to https://www.tiffany.com
    forceHttp: true,
    forceHttps: false,
    stripHash: true,
    stripTextFragment: true,
    removeQueryParameters: [/^utm_\w+/i, 'ref', 'ref_src'],
    removeTrailingSlash: true,
    removeSingleSlash: true,
    removeExplicitPort: true,
    sortQueryParameters: true,
    ...options,
  } as Required<Options>;

  if (!url) {
    throw new Error('Url undefined, cannot normalize');
  }

  return normalizeUrlImpl(url, opts);
}

const regex = new RegExp(tlds.map(t => `\\.${t}`).join('|'), 'gi');
export const UrlSchema = z.preprocess(
  val => val && normalizeUrl(String(val)),
  z
    .string()
    .url({
      message: 'Must be a valid url',
    })
    .trim()
    .refine(val => val.match(regex), {
      message: 'Must be a valid web page',
    }),
);
