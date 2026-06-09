import * as vscode from 'vscode';

import { getExternalSettings } from '../config/settings';
import {
  buildFanqieDownloaderDownloadUri,
  buildFanqieDownloaderSearchUri,
  normalizeFanqieDownloaderResults
} from '../services/external/fanqieDownloader';
import {
  buildOfficialServiceSearchUri,
  normalizeMusicBrainzRecordings,
  normalizeOpenLibraryWorks,
  type OfficialServiceId
} from '../services/external/officialServices';
import { registerSafeCommand } from './registerSafeCommand';
import type { MoyuCommandDependencies } from './types';

interface ExternalServicePick {
  label: string;
  description: string;
  serviceId: OfficialServiceId;
  mode: 'open' | 'api';
}

const servicePicks: ExternalServicePick[] = [
  {
    label: 'QQ 音乐',
    description: '打开 QQ 音乐官方网页搜索',
    serviceId: 'qqMusic',
    mode: 'open'
  },
  {
    label: 'Open Library',
    description: '使用 Open Library 官方搜索 API',
    serviceId: 'openLibrary',
    mode: 'api'
  },
  {
    label: 'MusicBrainz',
    description: '使用 MusicBrainz 官方录音搜索 API',
    serviceId: 'musicBrainz',
    mode: 'api'
  },
  {
    label: '番茄小说',
    description: '连接本地下载器或导入导出文件',
    serviceId: 'fanqieNovel',
    mode: 'open'
  }
];

export function registerOpenExternalServiceCommand(
  _dependencies: MoyuCommandDependencies
): vscode.Disposable {
  return registerSafeCommand('moyu.openExternalService', async () => {
    const pick = await vscode.window.showQuickPick(servicePicks, {
      title: '选择外部服务'
    });

    if (!pick) {
      return;
    }

    if (pick.serviceId === 'fanqieNovel') {
      await runFanqieNovelFlow();
      return;
    }

    const query = await vscode.window.showInputBox({
      title: `搜索 ${pick.label}`,
      prompt: '输入关键词',
      ignoreFocusOut: true
    });

    if (!query?.trim()) {
      return;
    }

    if (pick.mode === 'open') {
      const uri = buildOfficialServiceSearchUri(pick.serviceId, query);
      if (uri) {
        await vscode.env.openExternal(vscode.Uri.parse(uri.toString()));
      }
      return;
    }

    await runOfficialApiSearch(pick.serviceId, query);
  });
}

async function runOfficialApiSearch(serviceId: OfficialServiceId, query: string): Promise<void> {
  const uri = buildOfficialServiceSearchUri(serviceId, query);
  if (!uri) {
    return;
  }

  const init: RequestInit =
    serviceId === 'musicBrainz'
      ? { headers: { 'User-Agent': 'moyu-vscode/0.0.1 (https://github.com/jiulics/moyu_vscode)' } }
      : {};
  const response = await fetch(uri.toString(), init);

  if (!response.ok) {
    throw new Error(`官方服务请求失败：${response.status} ${response.statusText}`);
  }

  const data = (await response.json()) as unknown;
  const results =
    serviceId === 'openLibrary'
      ? normalizeOpenLibraryWorks(data)
      : normalizeMusicBrainzRecordings(data);

  if (results.length === 0) {
    void vscode.window.showInformationMessage('没有找到结果。');
    return;
  }

  const result = await vscode.window.showQuickPick(results, {
    title: '选择结果打开官方页面'
  });

  if (result) {
    await vscode.env.openExternal(vscode.Uri.parse(result.url));
  }
}

async function runFanqieNovelFlow(): Promise<void> {
  const action = await vscode.window.showQuickPick(
    [
      {
        label: '搜索本地下载器',
        description: '调用本机 fanqienovel-downloader Web API',
        action: 'search'
      },
      {
        label: '导入导出文件',
        description: '导入 .txt、.md 或 .json 导出文件',
        action: 'import'
      }
    ],
    {
      title: '番茄小说'
    }
  );

  if (!action) {
    return;
  }

  if (action.action === 'import') {
    await vscode.commands.executeCommand('moyu.importFanqieExport');
    return;
  }

  const query = await vscode.window.showInputBox({
    title: '搜索本地 Fanqie downloader',
    prompt: '输入小说关键词。请先启动 fanqienovel-downloader Web 服务。',
    ignoreFocusOut: true
  });

  if (!query?.trim()) {
    return;
  }

  await runFanqieDownloaderSearch(query);
}

async function runFanqieDownloaderSearch(query: string): Promise<void> {
  const baseUrl = getExternalSettings().fanqieDownloaderBaseUrl;
  const response = await fetch(buildFanqieDownloaderSearchUri(baseUrl, query).toString());

  if (!response.ok) {
    throw new Error(`本地 Fanqie downloader 搜索失败：${response.status} ${response.statusText}`);
  }

  const results = normalizeFanqieDownloaderResults((await response.json()) as unknown);
  if (results.length === 0) {
    void vscode.window.showInformationMessage('本地 Fanqie downloader 没有返回可用结果。');
    return;
  }

  const result = await vscode.window.showQuickPick(results, {
    title: '选择小说并加入下载队列'
  });

  if (!result) {
    return;
  }

  const downloadResponse = await fetch(
    buildFanqieDownloaderDownloadUri(baseUrl, result.novelId).toString()
  );
  const data = (await downloadResponse.json().catch(() => undefined)) as
    | { error?: unknown; status?: unknown }
    | undefined;

  if (!downloadResponse.ok || data?.error) {
    const detail = typeof data?.error === 'string' ? data.error : downloadResponse.statusText;
    throw new Error(`本地 Fanqie downloader 下载失败：${detail}`);
  }

  void vscode.window.showInformationMessage(
    `已发送到本地 Fanqie downloader：${result.label}。下载完成后可用 Moyu 导入导出文件。`
  );
}
