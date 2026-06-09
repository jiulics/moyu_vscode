import * as vscode from 'vscode';

import type { BreakTimer } from '../services/break/breakTimer';
import type { BreakStatsStore } from '../services/break/breakStatsStore';

export class BreakTimerProvider implements vscode.TreeDataProvider<vscode.TreeItem> {
  private readonly onDidChangeTreeDataEmitter = new vscode.EventEmitter<void>();
  readonly onDidChangeTreeData = this.onDidChangeTreeDataEmitter.event;

  constructor(
    private readonly timer: BreakTimer,
    private readonly statsStore: BreakStatsStore
  ) {}

  refresh(): void {
    this.onDidChangeTreeDataEmitter.fire();
  }

  getTreeItem(element: vscode.TreeItem): vscode.TreeItem {
    return element;
  }

  getChildren(): vscode.TreeItem[] {
    const timerState = this.timer.getState();
    const stats = this.statsStore.getToday();
    const timerLabel =
      timerState.status === 'running'
        ? `休息计时中：${timerState.minutes} 分钟`
        : '当前没有运行中的休息计时';
    const timerItem = new vscode.TreeItem(timerLabel, vscode.TreeItemCollapsibleState.None);
    timerItem.iconPath = new vscode.ThemeIcon(timerState.status === 'running' ? 'watch' : 'circle-outline');

    const statsItem = new vscode.TreeItem(
      `今日休息：${stats.breakCount} 次`,
      vscode.TreeItemCollapsibleState.None
    );
    statsItem.iconPath = new vscode.ThemeIcon('graph');

    return [timerItem, statsItem];
  }
}
