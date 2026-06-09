import * as path from 'node:path';
import * as vscode from 'vscode';

import type { MoyuCommandDependencies } from './types';
import { registerSafeCommand } from './registerSafeCommand';
import { ReaderPanel } from '../webview/reader/readerPanel';
import { inferTitleFromUri } from '../views/novelLibraryView';

interface AddNovelOptions {
  skipDialog?: boolean;
  uris?: vscode.Uri[];
}

const supportedNovelExtensions = new Set(['.txt', '.md']);

export function registerAddNovelCommand(dependencies: MoyuCommandDependencies): vscode.Disposable {
  return registerSafeCommand('moyu.addNovel', async (rawOptions?: unknown) => {
    const options = rawOptions as AddNovelOptions | undefined;
    const uris =
      options?.uris ??
      (options?.skipDialog
        ? undefined
        : await vscode.window.showOpenDialog({
            canSelectFiles: true,
            canSelectFolders: false,
            canSelectMany: true,
            filters: {
              Novel: ['txt', 'md']
            },
            title: '选择本地小说'
          }));

    if (!uris?.length) {
      return;
    }

    const addedUris: string[] = [];
    for (const uri of uris) {
      if (!supportedNovelExtensions.has(path.extname(uri.fsPath).toLowerCase())) {
        void vscode.window.showWarningMessage(`Moyu 暂不支持该小说格式：${path.basename(uri.fsPath)}`);
        continue;
      }

      const stat = await vscode.workspace.fs.stat(uri);
      const entry = await dependencies.novelLibraryStore.addNovel({
        uri: uri.toString(),
        title: inferTitleFromUri(uri),
        size: stat.size
      });
      addedUris.push(entry.uri);
    }

    dependencies.novelLibraryProvider.refresh();
    dependencies.miniReaderProvider.refresh();
    const firstUri = addedUris[0];
    if (firstUri) {
      await ReaderPanel.open(
        {
          context: dependencies.context,
          novelLibraryStore: dependencies.novelLibraryStore,
          readingProgressStore: dependencies.readingProgressStore
        },
        firstUri
      );
    }
  });
}
