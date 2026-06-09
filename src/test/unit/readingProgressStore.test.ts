import { describe, expect, it } from 'vitest';

import { ReadingProgressStore } from '../../services/novel/readingProgressStore';
import { MemoryJsonStore } from './memoryStore';

describe('ReadingProgressStore', () => {
  it('saves and retrieves progress for a novel uri', async () => {
    const store = new ReadingProgressStore(new MemoryJsonStore());

    await store.save({
      novelUri: 'file:///novel.txt',
      chapterIndex: 3,
      scrollPercent: 42,
      updatedAt: '2026-06-09T00:00:00.000Z',
      bookmarks: []
    });

    expect(store.get('file:///novel.txt')).toMatchObject({
      chapterIndex: 3,
      scrollPercent: 42
    });
  });

  it('clamps scroll percentages into a valid range', async () => {
    const store = new ReadingProgressStore(new MemoryJsonStore());

    await store.save({
      novelUri: 'file:///novel.txt',
      chapterIndex: 1,
      scrollPercent: 240,
      updatedAt: '2026-06-09T00:00:00.000Z',
      bookmarks: []
    });

    expect(store.get('file:///novel.txt')?.scrollPercent).toBe(100);
  });

  it('adds and removes bookmarks without duplicating ids', async () => {
    const store = new ReadingProgressStore(new MemoryJsonStore());

    await store.addBookmark('file:///novel.txt', {
      id: 'b1',
      chapterIndex: 0,
      label: '开头',
      createdAt: '2026-06-09T00:00:00.000Z'
    });
    await store.addBookmark('file:///novel.txt', {
      id: 'b1',
      chapterIndex: 1,
      label: '重复',
      createdAt: '2026-06-09T00:00:01.000Z'
    });
    await store.removeBookmark('file:///novel.txt', 'b1');

    expect(store.get('file:///novel.txt')?.bookmarks).toEqual([]);
  });
});
