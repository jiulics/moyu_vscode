import type * as vscode from 'vscode';

import type { BreakStatsStore } from '../services/break/breakStatsStore';
import type { BreakTimer } from '../services/break/breakTimer';
import type { MusicStatusBar } from '../services/music/musicStatusBar';
import type { PlaylistStore } from '../services/music/playlistStore';
import type { NovelLibraryStore } from '../services/novel/novelLibraryStore';
import type { ReadingProgressStore } from '../services/novel/readingProgressStore';
import type { BreakTimerProvider } from '../views/breakTimerView';
import type { NovelLibraryProvider } from '../views/novelLibraryView';
import type { PlaylistProvider } from '../views/playlistView';

export interface MoyuCommandDependencies {
  context: vscode.ExtensionContext;
  novelLibraryStore: NovelLibraryStore;
  readingProgressStore: ReadingProgressStore;
  playlistStore: PlaylistStore;
  breakTimer: BreakTimer;
  breakStatsStore: BreakStatsStore;
  novelLibraryProvider: NovelLibraryProvider;
  playlistProvider: PlaylistProvider;
  breakTimerProvider: BreakTimerProvider;
  musicStatusBar: MusicStatusBar;
}
