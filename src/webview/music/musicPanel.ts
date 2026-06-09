import * as path from 'node:path';
import * as vscode from 'vscode';

import { getMusicSettings } from '../../config/settings';
import type { MusicStatusBar } from '../../services/music/musicStatusBar';
import type { PlaylistStore, PlaylistTrack } from '../../services/music/playlistStore';
import { createWebviewHtml } from '../common/html';
import { parseIncomingMessage, parseOutgoingMessage } from '../common/messageProtocol';

export interface MusicPanelDependencies {
  context: vscode.ExtensionContext;
  playlistStore: PlaylistStore;
  statusBar: MusicStatusBar;
}

export class MusicPanel {
  private static currentPanel: MusicPanel | undefined;

  private constructor(
    private readonly panel: vscode.WebviewPanel,
    private readonly dependencies: MusicPanelDependencies
  ) {
    this.panel.onDidDispose(() => {
      MusicPanel.currentPanel = undefined;
      this.dependencies.statusBar.setPaused();
    });

    this.panel.webview.onDidReceiveMessage((rawMessage: unknown) => {
      try {
        this.handleMessage(rawMessage);
      } catch (error: unknown) {
        void vscode.window.showErrorMessage(formatError(error));
      }
    });
  }

  static async open(dependencies: MusicPanelDependencies): Promise<void> {
    const tracks = dependencies.playlistStore.list();
    MusicPanel.currentPanel?.panel.dispose();

    const panel = vscode.window.createWebviewPanel('moyuMusic', 'Moyu Music', vscode.ViewColumn.Active, {
      enableScripts: true,
      retainContextWhenHidden: true,
      localResourceRoots: [
        vscode.Uri.joinPath(dependencies.context.extensionUri, 'dist', 'webview', 'music'),
        vscode.Uri.joinPath(dependencies.context.extensionUri, 'dist', 'media'),
        ...getAudioRoots(tracks)
      ]
    });

    const musicPanel = new MusicPanel(panel, dependencies);
    MusicPanel.currentPanel = musicPanel;
    panel.reveal(vscode.ViewColumn.Active);
    await musicPanel.render();
  }

  private async render(): Promise<void> {
    const scriptUri = this.panel.webview.asWebviewUri(
      vscode.Uri.joinPath(this.dependencies.context.extensionUri, 'dist', 'webview', 'music', 'musicView.js')
    );
    const styleUri = this.panel.webview.asWebviewUri(
      vscode.Uri.joinPath(this.dependencies.context.extensionUri, 'dist', 'webview', 'music', 'musicView.css')
    );
    const tracks = this.dependencies.playlistStore.list().map((track) =>
      toWebviewTrack(this.panel.webview, track)
    );

    const message = parseOutgoingMessage({
      type: 'music.load',
      tracks,
      settings: getMusicSettings()
    });

    this.panel.webview.html = createWebviewHtml({
      webview: this.panel.webview,
      title: 'Moyu Music',
      scriptUri,
      styleUri,
      rootId: 'music-root',
      bootstrapData: message
    });

    await this.panel.webview.postMessage(message);
  }

  private handleMessage(rawMessage: unknown): void {
    const message = parseIncomingMessage(rawMessage);
    if (message.type !== 'music.status') {
      return;
    }

    if (message.status === 'playing' && message.title) {
      this.dependencies.statusBar.setPlaying(message.title);
    } else {
      this.dependencies.statusBar.setPaused();
    }
  }
}

function toWebviewTrack(webview: vscode.Webview, track: PlaylistTrack): PlaylistTrack {
  return {
    ...track,
    uri: webview.asWebviewUri(vscode.Uri.parse(track.uri)).toString()
  };
}

function getAudioRoots(tracks: PlaylistTrack[]): vscode.Uri[] {
  const roots = new Map<string, vscode.Uri>();
  for (const track of tracks) {
    const uri = vscode.Uri.parse(track.uri);
    if (uri.scheme === 'file') {
      const root = vscode.Uri.file(path.dirname(uri.fsPath));
      roots.set(root.toString(), root);
    }
  }
  return [...roots.values()];
}

function formatError(error: unknown): string {
  return error instanceof Error ? error.message : 'Moyu 音乐播放器遇到未知错误。';
}
