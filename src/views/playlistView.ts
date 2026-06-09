import * as vscode from 'vscode';

import type { PlaylistStore } from '../services/music/playlistStore';

export class PlaylistProvider implements vscode.TreeDataProvider<vscode.TreeItem> {
  private readonly onDidChangeTreeDataEmitter = new vscode.EventEmitter<void>();
  readonly onDidChangeTreeData = this.onDidChangeTreeDataEmitter.event;

  constructor(private readonly store: PlaylistStore) {}

  refresh(): void {
    this.onDidChangeTreeDataEmitter.fire();
  }

  getTreeItem(element: vscode.TreeItem): vscode.TreeItem {
    return element;
  }

  getChildren(): vscode.TreeItem[] {
    const tracks = this.store.list();

    if (tracks.length === 0) {
      return [createInfoItem('播放列表为空，点击标题栏添加本地音乐。')];
    }

    return tracks.map((track) => {
      const item = new vscode.TreeItem(track.title, vscode.TreeItemCollapsibleState.None);
      item.description = track.fileName;
      item.tooltip = track.uri;
      item.iconPath = new vscode.ThemeIcon('music');
      item.command = {
        command: 'moyu.openMusicPlayer',
        title: 'Open Music Player'
      };
      return item;
    });
  }
}

function createInfoItem(label: string): vscode.TreeItem {
  const item = new vscode.TreeItem(label, vscode.TreeItemCollapsibleState.None);
  item.iconPath = new vscode.ThemeIcon('info');
  return item;
}
