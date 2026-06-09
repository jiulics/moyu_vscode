import * as vscode from 'vscode';

export interface ReaderSettings {
  fontSize: number;
  lineHeight: number;
  theme: 'dark' | 'light' | 'green';
}

export interface MusicSettings {
  volume: number;
}

export function getReaderSettings(): ReaderSettings {
  const config = vscode.workspace.getConfiguration('moyu');
  return {
    fontSize: config.get<number>('reader.fontSize', 18),
    lineHeight: config.get<number>('reader.lineHeight', 1.8),
    theme: config.get<ReaderSettings['theme']>('reader.theme', 'dark')
  };
}

export function getMusicSettings(): MusicSettings {
  const config = vscode.workspace.getConfiguration('moyu');
  return {
    volume: config.get<number>('music.volume', 0.7)
  };
}

export function getDefaultBreakMinutes(): number {
  return vscode.workspace.getConfiguration('moyu').get<number>('break.defaultMinutes', 5);
}
