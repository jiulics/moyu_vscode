import * as vscode from 'vscode';

import { getReaderSettings } from '../../config/settings';
import { decodeTextBuffer } from '../../services/novel/encodingDetector';
import type { NovelLibraryStore } from '../../services/novel/novelLibraryStore';
import type { ReadingProgressStore } from '../../services/novel/readingProgressStore';
import { parseChapters } from '../../services/novel/chapterParser';
import { createWebviewHtml } from '../common/html';
import { parseIncomingMessage, parseOutgoingMessage } from '../common/messageProtocol';

export interface MiniReaderViewDependencies {
  context: vscode.ExtensionContext;
  novelLibraryStore: NovelLibraryStore;
  readingProgressStore: ReadingProgressStore;
}

export class MiniReaderViewProvider implements vscode.WebviewViewProvider {
  private view: vscode.WebviewView | undefined;

  constructor(private readonly dependencies: MiniReaderViewDependencies) {}

  resolveWebviewView(view: vscode.WebviewView): void {
    this.view = view;
    view.webview.options = {
      enableScripts: true,
      localResourceRoots: [
        vscode.Uri.joinPath(this.dependencies.context.extensionUri, 'dist', 'webview', 'reader'),
        vscode.Uri.joinPath(this.dependencies.context.extensionUri, 'dist', 'media')
      ]
    };

    view.webview.onDidReceiveMessage((rawMessage: unknown) => {
      this.handleMessage(rawMessage).catch((error: unknown) => {
        void vscode.window.showErrorMessage(formatError(error));
      });
    });

    this.render().catch((error: unknown) => {
      void vscode.window.showErrorMessage(formatError(error));
    });
  }

  refresh(): void {
    this.render().catch((error: unknown) => {
      void vscode.window.showErrorMessage(formatError(error));
    });
  }

  private async render(): Promise<void> {
    if (!this.view) {
      return;
    }

    const entry = this.dependencies.novelLibraryStore.list()[0];
    const scriptUri = this.view.webview.asWebviewUri(
      vscode.Uri.joinPath(this.dependencies.context.extensionUri, 'dist', 'webview', 'reader', 'readerView.js')
    );
    const styleUri = this.view.webview.asWebviewUri(
      vscode.Uri.joinPath(this.dependencies.context.extensionUri, 'dist', 'webview', 'reader', 'readerView.css')
    );

    if (!entry) {
      this.view.webview.html = createWebviewHtml({
        webview: this.view.webview,
        title: 'Moyu Mini Reader',
        scriptUri,
        styleUri,
        rootId: 'reader-root',
        bootstrapData: parseOutgoingMessage({
          type: 'reader.load',
          novelUri: '',
          title: '迷你阅读器',
          chapters: [],
          progress: undefined,
          settings: getReaderSettings()
        })
      });
      return;
    }

    const uri = vscode.Uri.parse(entry.uri);
    const bytes = await vscode.workspace.fs.readFile(uri);
    const decoded = decodeTextBuffer(Buffer.from(bytes));
    const chapters = parseChapters(decoded.text);
    const progress = this.dependencies.readingProgressStore.get(entry.uri);
    const message = parseOutgoingMessage({
      type: 'reader.load',
      novelUri: entry.uri,
      title: entry.title,
      chapters,
      progress,
      settings: getReaderSettings()
    });

    this.view.webview.html = createWebviewHtml({
      webview: this.view.webview,
      title: entry.title,
      scriptUri,
      styleUri,
      rootId: 'reader-root',
      bootstrapData: message
    });

    await this.view.webview.postMessage(message);
  }

  private async handleMessage(rawMessage: unknown): Promise<void> {
    const message = parseIncomingMessage(rawMessage);

    if (message.type === 'reader.saveProgress') {
      if (!message.novelUri) {
        return;
      }
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
      if (!message.novelUri) {
        return;
      }
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
  return error instanceof Error ? error.message : 'Moyu 迷你阅读器遇到未知错误。';
}
