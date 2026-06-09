import * as vscode from 'vscode';

export interface ReaderSettings {
  fontSize: number;
  lineHeight: number;
  theme: 'dark' | 'light' | 'green';
}

export interface MusicSettings {
  volume: number;
}

export interface ExternalSettings {
  fanqieDownloaderBaseUrl: string;
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

export function getExternalSettings(): ExternalSettings {
  const config = vscode.workspace.getConfiguration('moyu');
  return {
    fanqieDownloaderBaseUrl: config.get<string>(
      'external.fanqieDownloaderBaseUrl',
      'http://127.0.0.1:5000'
    )
  };
}

export function getDefaultBreakMinutes(): number {
  return vscode.workspace.getConfiguration('moyu').get<number>('break.defaultMinutes', 5);
}
