import * as path from 'node:path';
import * as vscode from 'vscode';

import type { NovelLibraryStore } from '../services/novel/novelLibraryStore';

export class NovelLibraryProvider implements vscode.TreeDataProvider<vscode.TreeItem> {
  private readonly onDidChangeTreeDataEmitter = new vscode.EventEmitter<void>();
  readonly onDidChangeTreeData = this.onDidChangeTreeDataEmitter.event;

  constructor(private readonly store: NovelLibraryStore) {}

  refresh(): void {
    this.onDidChangeTreeDataEmitter.fire();
  }

  getTreeItem(element: vscode.TreeItem): vscode.TreeItem {
    return element;
  }

  getChildren(): vscode.TreeItem[] {
    const novels = this.store.list();

    if (novels.length === 0) {
      return [createInfoItem('还没有小说，点击标题栏添加本地文件。')];
    }

    return novels.map((novel) => {
      const item = new vscode.TreeItem(novel.title, vscode.TreeItemCollapsibleState.None);
      item.description = formatSize(novel.size);
      item.tooltip = novel.uri;
      item.iconPath = new vscode.ThemeIcon('book');
      item.command = {
        command: 'moyu.openReader',
        title: 'Open Reader',
        arguments: [novel.uri]
      };
      return item;
    });
  }
}

export function inferTitleFromUri(uri: vscode.Uri): string {
  return path.basename(uri.fsPath, path.extname(uri.fsPath));
}

function createInfoItem(label: string): vscode.TreeItem {
  const item = new vscode.TreeItem(label, vscode.TreeItemCollapsibleState.None);
  item.iconPath = new vscode.ThemeIcon('info');
  return item;
}

function formatSize(bytes: number): string {
  if (bytes < 1024 * 1024) {
    return `${Math.ceil(bytes / 1024)} KB`;
  }
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}
