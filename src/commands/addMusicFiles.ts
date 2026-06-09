import * as path from 'node:path';
import * as vscode from 'vscode';

import { registerSafeCommand } from './registerSafeCommand';
import type { MoyuCommandDependencies } from './types';
import { isSupportedAudioFile } from '../services/music/supportedAudio';
import { MusicPanel } from '../webview/music/musicPanel';

interface AddMusicOptions {
  skipDialog?: boolean;
  uris?: vscode.Uri[];
}

export function registerAddMusicFilesCommand(dependencies: MoyuCommandDependencies): vscode.Disposable {
  return registerSafeCommand('moyu.addMusicFiles', async (rawOptions?: unknown) => {
    const options = rawOptions as AddMusicOptions | undefined;
    const uris =
      options?.uris ??
      (options?.skipDialog
        ? undefined
        : await vscode.window.showOpenDialog({
            canSelectFiles: true,
            canSelectFolders: false,
            canSelectMany: true,
            filters: {
              Audio: ['mp3', 'wav', 'ogg', 'm4a', 'flac']
            },
            title: '选择本地音乐'
          }));

    if (!uris?.length) {
      return;
    }

    const tracks = [];
    for (const uri of uris) {
      const fileName = path.basename(uri.fsPath);
      if (!isSupportedAudioFile(fileName)) {
        void vscode.window.showWarningMessage(`Moyu 暂不支持该音乐格式：${fileName}`);
        continue;
      }

      await vscode.workspace.fs.stat(uri);
      tracks.push({
        uri: uri.toString(),
        title: path.basename(uri.fsPath, path.extname(uri.fsPath)),
        fileName,
        addedAt: new Date().toISOString()
      });
    }

    if (tracks.length === 0) {
      return;
    }

    await dependencies.playlistStore.addTracks(tracks);
    dependencies.playlistProvider.refresh();
    await MusicPanel.open({
      context: dependencies.context,
      playlistStore: dependencies.playlistStore,
      statusBar: dependencies.musicStatusBar
    });
  });
}
