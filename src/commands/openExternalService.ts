import * as vscode from 'vscode';

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
    description: '没有公开官方 API；打开导入说明',
    serviceId: 'fanqieNovel',
    mode: 'open'
  }
];

export function registerOpenExternalServiceCommand(
  _dependencies: MoyuCommandDependencies
): vscode.Disposable {
  return registerSafeCommand('moyu.openExternalService', async () => {
    const pick = await vscode.window.showQuickPick(servicePicks, {
      title: '选择外部官方服务'
    });

    if (!pick) {
      return;
    }

    if (pick.serviceId === 'fanqieNovel') {
      await vscode.commands.executeCommand('moyu.importFanqieExport');
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
