import type { KeyValueStore } from './key-value-store';

export class MapKeyValueStore implements KeyValueStore {
  private readonly values = new Map<string, string>();

  constructor(initial?: Readonly<Record<string, string>>) {
    if (initial) {
      for (const [key, value] of Object.entries(initial)) {
        this.values.set(key, value);
      }
    }
  }

  async getItem(key: string): Promise<string | null> {
    return this.values.get(key) ?? null;
  }

  async setItem(key: string, value: string): Promise<void> {
    this.values.set(key, value);
  }
}
