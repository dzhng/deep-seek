export type TableCell = {
  text: string;
  confidence: number;
  sources: { title?: string; url: string }[];
};

export type ContentResult = {
  reason: string;
  title: string;
  text: string;
};

export type ContentResultWithSources = ContentResult & {
  sources: { title?: string; url: string }[];
};
