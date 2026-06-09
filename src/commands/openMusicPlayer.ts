import type * as vscode from 'vscode';

import { registerSafeCommand } from './registerSafeCommand';
import type { MoyuCommandDependencies } from './types';
import { MusicPanel } from '../webview/music/musicPanel';

export function registerOpenMusicPlayerCommand(dependencies: MoyuCommandDependencies): vscode.Disposable {
  return registerSafeCommand('moyu.openMusicPlayer', async () => {
    await MusicPanel.open({
      context: dependencies.context,
      playlistStore: dependencies.playlistStore,
      statusBar: dependencies.musicStatusBar
    });
  });
}
