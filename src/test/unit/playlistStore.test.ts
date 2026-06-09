import { describe, expect, it } from 'vitest';

import { PlaylistStore } from '../../services/music/playlistStore';
import { isSupportedAudioFile } from '../../services/music/supportedAudio';
import { MemoryJsonStore } from './memoryStore';

describe('isSupportedAudioFile', () => {
  it('accepts common local audio file types', () => {
    expect(isSupportedAudioFile('file:///music/song.mp3')).toBe(true);
    expect(isSupportedAudioFile('file:///music/song.FLAC')).toBe(true);
  });

  it('rejects unsupported extensions', () => {
    expect(isSupportedAudioFile('file:///music/song.txt')).toBe(false);
  });
});

describe('PlaylistStore', () => {
  it('adds tracks and keeps stable ordering', async () => {
    const store = new PlaylistStore(new MemoryJsonStore());

    await store.addTracks([
      { uri: 'file:///a.mp3', title: 'A', fileName: 'a.mp3', addedAt: '2026-06-09T00:00:00.000Z' },
      { uri: 'file:///b.wav', title: 'B', fileName: 'b.wav', addedAt: '2026-06-09T00:00:01.000Z' }
    ]);

    expect(store.list().map((track) => track.order)).toEqual([0, 1]);
  });

  it('updates duplicate tracks instead of adding another row', async () => {
    const store = new PlaylistStore(new MemoryJsonStore());

    await store.addTracks([
      { uri: 'file:///a.mp3', title: 'A', fileName: 'a.mp3', addedAt: '2026-06-09T00:00:00.000Z' },
      { uri: 'file:///a.mp3', title: 'A2', fileName: 'a.mp3', addedAt: '2026-06-09T00:00:01.000Z' }
    ]);

    expect(store.list()).toHaveLength(1);
    expect(store.list()[0]?.title).toBe('A2');
  });

  it('clears the playlist', async () => {
    const store = new PlaylistStore(new MemoryJsonStore());

    await store.addTracks([
      { uri: 'file:///a.mp3', title: 'A', fileName: 'a.mp3', addedAt: '2026-06-09T00:00:00.000Z' }
    ]);
    await store.clear();

    expect(store.list()).toEqual([]);
  });

  it('rejects unsupported files with a user-facing message', async () => {
    const store = new PlaylistStore(new MemoryJsonStore());

    await expect(
      store.addTracks([
        { uri: 'file:///notes.txt', title: 'Notes', fileName: 'notes.txt', addedAt: '2026-06-09T00:00:00.000Z' }
      ])
    ).rejects.toThrow('Unsupported audio file: notes.txt');
  });
});
