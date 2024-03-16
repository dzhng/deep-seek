export type Events = {
  'test/noop': { data: unknown };
  'app/query.run': { data: { prompt: string } };
};

export type EventKeys = keyof Events;
