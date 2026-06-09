import type { JsonStore } from '../storage/jsonStore';

export interface Bookmark {
  id: string;
  chapterIndex: number;
  label: string;
  createdAt: string;
}

export interface ReadingProgress {
  novelUri: string;
  chapterIndex: number;
  scrollPercent: number;
  updatedAt: string;
  bookmarks: Bookmark[];
}

type ProgressState = Record<string, ReadingProgress>;

export class ReadingProgressStore {
  constructor(private readonly store: JsonStore<ProgressState>) {}

  get(novelUri: string): ReadingProgress | undefined {
    return this.store.get({})[novelUri];
  }

  async save(progress: ReadingProgress): Promise<void> {
    const state = this.store.get({});
    state[progress.novelUri] = normalizeProgress(progress);
    await this.store.update(state);
  }

  async addBookmark(novelUri: string, bookmark: Bookmark): Promise<void> {
    const current = this.get(novelUri) ?? createDefaultProgress(novelUri);
    const bookmarks = current.bookmarks.filter((item) => item.id !== bookmark.id);
    bookmarks.push(bookmark);
    await this.save({ ...current, bookmarks, updatedAt: new Date().toISOString() });
  }

  async removeBookmark(novelUri: string, bookmarkId: string): Promise<void> {
    const current = this.get(novelUri);
    if (!current) {
      return;
    }

    await this.save({
      ...current,
      bookmarks: current.bookmarks.filter((bookmark) => bookmark.id !== bookmarkId),
      updatedAt: new Date().toISOString()
    });
  }
}

function normalizeProgress(progress: ReadingProgress): ReadingProgress {
  return {
    ...progress,
    chapterIndex: Math.max(0, Math.trunc(progress.chapterIndex)),
    scrollPercent: Math.min(100, Math.max(0, progress.scrollPercent)),
    bookmarks: dedupeBookmarks(progress.bookmarks)
  };
}

function createDefaultProgress(novelUri: string): ReadingProgress {
  return {
    novelUri,
    chapterIndex: 0,
    scrollPercent: 0,
    updatedAt: new Date().toISOString(),
    bookmarks: []
  };
}

function dedupeBookmarks(bookmarks: Bookmark[]): Bookmark[] {
  const seen = new Set<string>();
  return bookmarks.filter((bookmark) => {
    if (seen.has(bookmark.id)) {
      return false;
    }
    seen.add(bookmark.id);
    return true;
  });
}
