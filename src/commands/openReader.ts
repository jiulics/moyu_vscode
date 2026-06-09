import type * as vscode from 'vscode';

import { registerSafeCommand } from './registerSafeCommand';
import type { MoyuCommandDependencies } from './types';
import { ReaderPanel } from '../webview/reader/readerPanel';

export function registerOpenReaderCommand(dependencies: MoyuCommandDependencies): vscode.Disposable {
  return registerSafeCommand('moyu.openReader', async (rawNovelUri?: unknown) => {
    const novelUri = typeof rawNovelUri === 'string' ? rawNovelUri : undefined;
    await ReaderPanel.open(
      {
        context: dependencies.context,
        novelLibraryStore: dependencies.novelLibraryStore,
        readingProgressStore: dependencies.readingProgressStore
      },
      novelUri
    );
    dependencies.novelLibraryProvider.refresh();
  });
}
