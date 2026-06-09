import * as vscode from 'vscode';

import { registerAddMusicFilesCommand } from './commands/addMusicFiles';
import { registerAddNovelCommand } from './commands/addNovel';
import { registerClearPlaylistCommand } from './commands/clearPlaylist';
import { registerImportFanqieExportCommand } from './commands/importFanqieExport';
import { registerOpenExternalServiceCommand } from './commands/openExternalService';
import { registerOpenMusicPlayerCommand } from './commands/openMusicPlayer';
import { registerOpenReaderCommand } from './commands/openReader';
import { registerShowNovelLibraryCommand } from './commands/showNovelLibrary';
import { registerStartBreakTimerCommand } from './commands/startBreakTimer';
import { registerStopBreakTimerCommand } from './commands/stopBreakTimer';
import type { MoyuCommandDependencies } from './commands/types';
import { BreakStatsStore } from './services/break/breakStatsStore';
import { BreakTimer } from './services/break/breakTimer';
import { MusicStatusBar } from './services/music/musicStatusBar';
import { PlaylistStore } from './services/music/playlistStore';
import { NovelLibraryStore } from './services/novel/novelLibraryStore';
import { ReadingProgressStore } from './services/novel/readingProgressStore';
import { MementoJsonStore } from './services/storage/mementoJsonStore';
import { BreakTimerProvider } from './views/breakTimerView';
import { NovelLibraryProvider } from './views/novelLibraryView';
import { PlaylistProvider } from './views/playlistView';
import { MiniReaderViewProvider } from './webview/reader/miniReaderViewProvider';

export function activate(context: vscode.ExtensionContext): void {
  const novelLibraryStore = new NovelLibraryStore(
    new MementoJsonStore(context.globalState, 'moyu.novelLibrary')
  );
  const readingProgressStore = new ReadingProgressStore(
    new MementoJsonStore(context.globalState, 'moyu.readingProgress')
  );
  const playlistStore = new PlaylistStore(new MementoJsonStore(context.globalState, 'moyu.playlist'));
  const breakStatsStore = new BreakStatsStore(
    new MementoJsonStore(context.globalState, 'moyu.breakStats')
  );
  const musicStatusBar = new MusicStatusBar();
  const breakTimer = new BreakTimer((minutes) => {
    void breakStatsStore.recordBreak().then(() => breakTimerProvider.refresh());
    void vscode.window.showInformationMessage(`Moyu ${minutes} 分钟休息时间到。`);
  });
  const novelLibraryProvider = new NovelLibraryProvider(novelLibraryStore);
  const miniReaderProvider = new MiniReaderViewProvider({
    context,
    novelLibraryStore,
    readingProgressStore
  });
  const playlistProvider = new PlaylistProvider(playlistStore);
  const breakTimerProvider = new BreakTimerProvider(breakTimer, breakStatsStore);

  const dependencies: MoyuCommandDependencies = {
    context,
    novelLibraryStore,
    readingProgressStore,
    playlistStore,
    breakTimer,
    breakStatsStore,
    novelLibraryProvider,
    miniReaderProvider,
    playlistProvider,
    breakTimerProvider,
    musicStatusBar
  };

  context.subscriptions.push(
    musicStatusBar,
    breakTimer,
    vscode.window.registerTreeDataProvider('moyuNovelLibrary', novelLibraryProvider),
    vscode.window.registerWebviewViewProvider('moyuMiniReader', miniReaderProvider),
    vscode.window.registerTreeDataProvider('moyuPlaylist', playlistProvider),
    vscode.window.registerTreeDataProvider('moyuBreakTimer', breakTimerProvider),
    registerAddNovelCommand(dependencies),
    registerImportFanqieExportCommand(dependencies),
    registerOpenReaderCommand(dependencies),
    registerShowNovelLibraryCommand(dependencies),
    registerOpenExternalServiceCommand(dependencies),
    registerAddMusicFilesCommand(dependencies),
    registerOpenMusicPlayerCommand(dependencies),
    registerClearPlaylistCommand(dependencies),
    registerStartBreakTimerCommand(dependencies),
    registerStopBreakTimerCommand(dependencies)
  );
}

export function deactivate(): void {
  // VS Code disposes registered subscriptions from the extension context.
}
