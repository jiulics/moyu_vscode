import * as vscode from 'vscode';

import { registerSafeCommand } from './registerSafeCommand';
import type { MoyuCommandDependencies } from './types';
import { ReaderPanel } from '../webview/reader/readerPanel';

interface ShowNovelLibraryOptions {
  skipQuickPick?: boolean;
}

export function registerShowNovelLibraryCommand(dependencies: MoyuCommandDependencies): vscode.Disposable {
  return registerSafeCommand('moyu.showNovelLibrary', async (rawOptions?: unknown) => {
    const options = rawOptions as ShowNovelLibraryOptions | undefined;
    const novels = dependencies.novelLibraryStore.list();

    if (novels.length === 0) {
      void vscode.window.showInformationMessage('Moyu 还没有小说，请先添加本地文件。');
      return;
    }

    if (options?.skipQuickPick) {
      return;
    }

    const pick = await vscode.window.showQuickPick(
      novels.map((novel) => ({
        label: novel.title,
        description: novel.uri,
        novelUri: novel.uri
      })),
      { title: '选择一本小说' }
    );

    if (!pick) {
      return;
    }

    await ReaderPanel.open(
      {
        context: dependencies.context,
        novelLibraryStore: dependencies.novelLibraryStore,
        readingProgressStore: dependencies.readingProgressStore
      },
      pick.novelUri
    );
  });
}
