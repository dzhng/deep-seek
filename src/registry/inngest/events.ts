export type Events = {
  'test/noop': { data: any };
  'app/query.run': { data: { prompt: string } };
};

export type EventKeys = keyof Events;
