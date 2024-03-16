export const isProduction = process.env.NEXT_PUBLIC_VERCEL_ENV === 'production';
export const isDev = process.env.NODE_ENV !== 'production';
export const isBrowser = typeof window === 'object';
