import * as path from 'node:path';
import * as vscode from 'vscode';

import { registerSafeCommand } from './registerSafeCommand';
import type { MoyuCommandDependencies } from './types';
import { parseFanqieJsonExport } from '../services/external/fanqieExport';
import { decodeTextBuffer } from '../services/novel/encodingDetector';
import { inferTitleFromUri } from '../views/novelLibraryView';

interface ImportFanqieOptions {
  skipDialog?: boolean;
  uris?: vscode.Uri[];
}

export function registerImportFanqieExportCommand(
  dependencies: MoyuCommandDependencies
): vscode.Disposable {
  return registerSafeCommand('moyu.importFanqieExport', async (rawOptions?: unknown) => {
    const options = rawOptions as ImportFanqieOptions | undefined;
    const uris =
      options?.uris ??
      (options?.skipDialog
        ? undefined
        : await vscode.window.showOpenDialog({
            canSelectFiles: true,
            canSelectFolders: false,
            canSelectMany: true,
            filters: {
              'Fanqie Export': ['txt', 'md', 'json']
            },
            title: '导入番茄小说导出文件'
          }));

    if (!uris?.length) {
      return;
    }

    for (const uri of uris) {
      const extension = path.extname(uri.fsPath).toLowerCase();
      if (!['.txt', '.md', '.json'].includes(extension)) {
        void vscode.window.showWarningMessage(`不支持的导出格式：${path.basename(uri.fsPath)}`);
        continue;
      }

      const imported = await normalizeImportTarget(dependencies, uri);
      const stat = await vscode.workspace.fs.stat(imported.uri);
      await dependencies.novelLibraryStore.addNovel({
        uri: imported.uri.toString(),
        title: imported.title,
        size: stat.size
      });
    }

    dependencies.novelLibraryProvider.refresh();
    dependencies.miniReaderProvider.refresh();
    void vscode.window.showInformationMessage('已导入本地番茄导出文件，可在小说库中打开。');
  });
}

async function normalizeImportTarget(
  dependencies: MoyuCommandDependencies,
  uri: vscode.Uri
): Promise<{ uri: vscode.Uri; title: string }> {
  if (path.extname(uri.fsPath).toLowerCase() !== '.json') {
    return {
      uri,
      title: inferTitleFromUri(uri)
    };
  }

  const raw = await vscode.workspace.fs.readFile(uri);
  const decoded = decodeTextBuffer(Buffer.from(raw));
  const parsed = parseFanqieJsonExport(decoded.text, inferTitleFromUri(uri));
  const storageDir = vscode.Uri.joinPath(dependencies.context.globalStorageUri, 'fanqie-imports');
  await vscode.workspace.fs.createDirectory(storageDir);
  const safeName = `${sanitizeFileName(parsed.title)}-${Date.now()}.txt`;
  const target = vscode.Uri.joinPath(storageDir, safeName);
  await vscode.workspace.fs.writeFile(target, Buffer.from(parsed.text, 'utf8'));

  return {
    uri: target,
    title: parsed.title
  };
}

function sanitizeFileName(fileName: string): string {
  const withoutReservedCharacters = fileName.replace(/[<>:"/\\|?*]/g, '_');
  const withoutControlCharacters = [...withoutReservedCharacters]
    .map((character) => (character.charCodeAt(0) < 32 ? '_' : character))
    .join('');
  return withoutControlCharacters.slice(0, 80) || 'fanqie-export';
}
