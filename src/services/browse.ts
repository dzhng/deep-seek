import ky from 'ky';

const BrowseApiEndpoint = 'https://browse-api.vercel.app';
const BrowseApiToken = process.env.BROWSE_API_TOKEN ?? '';

export type BrowseResult = {
  url: string;
  title?: string;
  content: string;
};

// This method is needed because calling the browse method directly is not supported on vercel's edge env. So we'll host browse under a normal node route, and the edge route (via inngest) call it.
export async function browse(params: {
  url: string;
  maxContentLen?: number;
  slowFallback?: boolean;
}): Promise<BrowseResult | undefined> {
  try {
    const res = await ky(`${BrowseApiEndpoint}/api/markdown`, {
      searchParams: { token: BrowseApiToken, ...params },
      // browse api endpoint has timeout of 5 min
      timeout: 300_000,
    });
    return { ...(await res.json<BrowseResult>()), url: params.url };
  } catch (e: any) {
    console.error('Error calling browse endpoint', params, e.message);
    return;
  }
}
