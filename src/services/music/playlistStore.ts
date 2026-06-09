import type { JsonStore } from '../storage/jsonStore';
import { isSupportedAudioFile } from './supportedAudio';

export interface PlaylistTrackInput {
  uri: string;
  title: string;
  fileName: string;
  addedAt: string;
  durationSeconds?: number;
}

export interface PlaylistTrack extends PlaylistTrackInput {
  order: number;
}

type PlaylistState = PlaylistTrack[];

export class PlaylistStore {
  constructor(private readonly store: JsonStore<PlaylistState>) {}

  list(): PlaylistTrack[] {
    return [...this.store.get([])].sort((left, right) => left.order - right.order);
  }

  async addTracks(inputs: PlaylistTrackInput[]): Promise<PlaylistTrack[]> {
    const current = this.list();

    for (const input of inputs) {
      if (!isSupportedAudioFile(input.fileName)) {
        throw new Error(`Unsupported audio file: ${input.fileName}`);
      }

      const existingIndex = current.findIndex((track) => track.uri === input.uri);
      if (existingIndex >= 0) {
        current[existingIndex] = {
          ...current[existingIndex],
          ...input,
          order: current[existingIndex]?.order ?? existingIndex
        };
      } else {
        current.push({
          ...input,
          order: current.length
        });
      }
    }

    const normalized = current.map((track, index) => ({ ...track, order: index }));
    await this.store.update(normalized);
    return normalized;
  }

  async remove(uri: string): Promise<void> {
    await this.store.update(
      this.list()
        .filter((track) => track.uri !== uri)
        .map((track, index) => ({ ...track, order: index }))
    );
  }

  async clear(): Promise<void> {
    await this.store.update([]);
  }
}
