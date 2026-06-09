import * as vscode from 'vscode';

import { registerSafeCommand } from './registerSafeCommand';
import type { MoyuCommandDependencies } from './types';

interface ClearPlaylistOptions {
  skipConfirm?: boolean;
}

export function registerClearPlaylistCommand(dependencies: MoyuCommandDependencies): vscode.Disposable {
  return registerSafeCommand('moyu.clearPlaylist', async (rawOptions?: unknown) => {
    const options = rawOptions as ClearPlaylistOptions | undefined;
    if (!options?.skipConfirm) {
      const choice = await vscode.window.showWarningMessage('确定清空 Moyu 播放列表吗？', '清空');
      if (choice !== '清空') {
        return;
      }
    }

    await dependencies.playlistStore.clear();
    dependencies.playlistProvider.refresh();
    dependencies.musicStatusBar.setPaused();
  });
}
