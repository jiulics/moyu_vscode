import type { JsonStore } from '../storage/jsonStore';

export interface NovelEntry {
  uri: string;
  title: string;
  size: number;
  addedAt: string;
  lastOpenedAt?: string;
}

type NovelLibraryState = NovelEntry[];

export class NovelLibraryStore {
  constructor(private readonly store: JsonStore<NovelLibraryState>) {}

  list(): NovelEntry[] {
    return [...this.store.get([])].sort((left, right) =>
      (right.lastOpenedAt ?? right.addedAt).localeCompare(left.lastOpenedAt ?? left.addedAt)
    );
  }

  get(uri: string): NovelEntry | undefined {
    return this.store.get([]).find((entry) => entry.uri === uri);
  }

  async addNovel(entry: Omit<NovelEntry, 'addedAt'> & { addedAt?: string }): Promise<NovelEntry> {
    const current = this.store.get([]);
    const existingIndex = current.findIndex((item) => item.uri === entry.uri);
    const addedAt = entry.addedAt ?? new Date().toISOString();
    const nextEntry: NovelEntry = {
      ...entry,
      addedAt
    };

    if (existingIndex >= 0) {
      current[existingIndex] = {
        ...current[existingIndex],
        ...nextEntry,
        addedAt: current[existingIndex]?.addedAt ?? addedAt
      };
    } else {
      current.push(nextEntry);
    }

    await this.store.update(current);
    return nextEntry;
  }

  async markOpened(uri: string, openedAt = new Date().toISOString()): Promise<void> {
    const current = this.store.get([]);
    const next = current.map((entry) =>
      entry.uri === uri ? { ...entry, lastOpenedAt: openedAt } : entry
    );
    await this.store.update(next);
  }

  async remove(uri: string): Promise<void> {
    await this.store.update(this.store.get([]).filter((entry) => entry.uri !== uri));
  }
}
