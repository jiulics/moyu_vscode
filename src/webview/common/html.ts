import type * as vscode from 'vscode';

import { createContentSecurityPolicy } from './csp';
import { createNonce } from './nonce';

export interface WebviewHtmlOptions {
  webview: vscode.Webview;
  title: string;
  scriptUri: vscode.Uri;
  styleUri: vscode.Uri;
  rootId: string;
  bootstrapData?: unknown;
}

export function createWebviewHtml(options: WebviewHtmlOptions): string {
  const nonce = createNonce();
  const csp = createContentSecurityPolicy(options.webview, nonce);

  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="Content-Security-Policy" content="${csp}">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(options.title)}</title>
  <link rel="stylesheet" href="${options.styleUri.toString()}">
</head>
<body>
  <main id="${options.rootId}"></main>
  ${createBootstrapScript(options.bootstrapData, nonce)}
  <script nonce="${nonce}" src="${options.scriptUri.toString()}"></script>
</body>
</html>`;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function createBootstrapScript(data: unknown, nonce: string): string {
  if (data === undefined) {
    return '';
  }

  return `<script nonce="${nonce}" id="moyu-bootstrap" type="application/json">${escapeJsonForHtml(
    JSON.stringify(data)
  )}</script>`;
}

function escapeJsonForHtml(value: string): string {
  return value.replace(/</g, '\\u003C').replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029');
}
