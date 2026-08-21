export const GOALS_STORAGE_KEY = 'sgw.goals.v1';

export type KeyValueStore = {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
};
