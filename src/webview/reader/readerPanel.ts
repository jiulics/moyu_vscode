import * as vscode from 'vscode';

import { getReaderSettings } from '../../config/settings';
import { decodeTextBuffer } from '../../services/novel/encodingDetector';
import type { NovelLibraryStore } from '../../services/novel/novelLibraryStore';
import type { ReadingProgressStore } from '../../services/novel/readingProgressStore';
import { parseChapters } from '../../services/novel/chapterParser';
import { createWebviewHtml } from '../common/html';
import { parseIncomingMessage, parseOutgoingMessage } from '../common/messageProtocol';

const confirmLoadSize = 30 * 1024 * 1024;
const maxLoadSize = 80 * 1024 * 1024;

export interface ReaderPanelDependencies {
  context: vscode.ExtensionContext;
  novelLibraryStore: NovelLibraryStore;
  readingProgressStore: ReadingProgressStore;
}

export class ReaderPanel {
  private static currentPanel: ReaderPanel | undefined;

  private constructor(
    private readonly panel: vscode.WebviewPanel,
    private readonly dependencies: ReaderPanelDependencies
  ) {
    this.panel.onDidDispose(() => {
      ReaderPanel.currentPanel = undefined;
    });

    this.panel.webview.onDidReceiveMessage((rawMessage: unknown) => {
      this.handleMessage(rawMessage).catch((error: unknown) => {
        void vscode.window.showErrorMessage(formatError(error));
      });
    });
  }

  static async open(dependencies: ReaderPanelDependencies, novelUri?: string): Promise<void> {
    const entry =
      (novelUri ? dependencies.novelLibraryStore.get(novelUri) : undefined) ??
      dependencies.novelLibraryStore.list()[0];

    if (!entry) {
      void vscode.window.showInformationMessage('Moyu 还没有小说，请先添加本地 .txt 或 .md 文件。');
      return;
    }

    const panel =
      ReaderPanel.currentPanel?.panel ??
      vscode.window.createWebviewPanel('moyuReader', 'Moyu Reader', vscode.ViewColumn.Active, {
        enableScripts: true,
        retainContextWhenHidden: true,
        localResourceRoots: [
          vscode.Uri.joinPath(dependencies.context.extensionUri, 'dist', 'webview', 'reader'),
          vscode.Uri.joinPath(dependencies.context.extensionUri, 'dist', 'media')
        ]
      });

    const readerPanel =
      ReaderPanel.currentPanel ?? new ReaderPanel(panel, dependencies);
    ReaderPanel.currentPanel = readerPanel;
    panel.reveal(vscode.ViewColumn.Active);
    await readerPanel.render(entry.uri);
  }

  private async render(novelUri: string): Promise<void> {
    const entry = this.dependencies.novelLibraryStore.get(novelUri);
    if (!entry) {
      void vscode.window.showErrorMessage('Moyu 找不到这本小说，请重新添加。');
      return;
    }

    const uri = vscode.Uri.parse(entry.uri);
    const stat = await vscode.workspace.fs.stat(uri);
    if (stat.size > maxLoadSize) {
      void vscode.window.showErrorMessage('文件超过 80MB，Moyu 为避免卡顿不会一次性载入。');
      return;
    }

    if (stat.size > confirmLoadSize) {
      const choice = await vscode.window.showWarningMessage(
        '这本小说超过 30MB，打开可能需要一点时间。',
        '继续打开'
      );
      if (choice !== '继续打开') {
        return;
      }
    }

    const bytes = await vscode.workspace.fs.readFile(uri);
    const decoded = decodeTextBuffer(Buffer.from(bytes));
    const chapters = parseChapters(decoded.text);
    const progress = this.dependencies.readingProgressStore.get(entry.uri);
    const scriptUri = this.panel.webview.asWebviewUri(
      vscode.Uri.joinPath(this.dependencies.context.extensionUri, 'dist', 'webview', 'reader', 'readerView.js')
    );
    const styleUri = this.panel.webview.asWebviewUri(
      vscode.Uri.joinPath(this.dependencies.context.extensionUri, 'dist', 'webview', 'reader', 'readerView.css')
    );

    this.panel.title = `Moyu: ${entry.title}`;
    const message = parseOutgoingMessage({
      type: 'reader.load',
      novelUri: entry.uri,
      title: entry.title,
      chapters,
      progress,
      settings: getReaderSettings()
    });

    this.panel.webview.html = createWebviewHtml({
      webview: this.panel.webview,
      title: entry.title,
      scriptUri,
      styleUri,
      rootId: 'reader-root',
      bootstrapData: message
    });

    await this.dependencies.novelLibraryStore.markOpened(entry.uri);
    await this.panel.webview.postMessage(message);
  }

  private async handleMessage(rawMessage: unknown): Promise<void> {
    const message = parseIncomingMessage(rawMessage);

    if (message.type === 'reader.saveProgress') {
      const current = this.dependencies.readingProgressStore.get(message.novelUri);
      await this.dependencies.readingProgressStore.save({
        novelUri: message.novelUri,
        chapterIndex: message.chapterIndex,
        scrollPercent: message.scrollPercent,
        updatedAt: new Date().toISOString(),
        bookmarks: current?.bookmarks ?? []
      });
      return;
    }

    if (message.type === 'reader.addBookmark') {
      await this.dependencies.readingProgressStore.addBookmark(message.novelUri, {
        id: `${message.chapterIndex}-${Date.now()}`,
        chapterIndex: message.chapterIndex,
        label: message.label,
        createdAt: new Date().toISOString()
      });
    }
  }
}

function formatError(error: unknown): string {
  return error instanceof Error ? error.message : 'Moyu 阅读器遇到未知错误。';
}
