import * as vscode from 'vscode';

export class MusicStatusBar {
  private readonly item: vscode.StatusBarItem;

  constructor() {
    this.item = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 90);
    this.item.command = 'moyu.openMusicPlayer';
    this.setPaused();
    this.item.show();
  }

  setPaused(): void {
    this.item.text = '$(debug-pause) Moyu: Paused';
    this.item.tooltip = 'Open Moyu music player';
  }

  setPlaying(title: string): void {
    this.item.text = `$(play) Moyu: ${title}`;
    this.item.tooltip = 'Open Moyu music player';
  }

  dispose(): void {
    this.item.dispose();
  }
}
