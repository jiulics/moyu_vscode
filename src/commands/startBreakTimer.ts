import * as vscode from 'vscode';

import { getDefaultBreakMinutes } from '../config/settings';
import { registerSafeCommand } from './registerSafeCommand';
import type { MoyuCommandDependencies } from './types';

interface StartBreakTimerOptions {
  minutes?: number;
}

export function registerStartBreakTimerCommand(dependencies: MoyuCommandDependencies): vscode.Disposable {
  return registerSafeCommand('moyu.startBreakTimer', (rawOptions?: unknown) => {
    const options = rawOptions as StartBreakTimerOptions | undefined;
    const minutes = options?.minutes ?? getDefaultBreakMinutes();
    dependencies.breakTimer.start(minutes);
    dependencies.breakTimerProvider.refresh();
    void vscode.window.showInformationMessage(`Moyu 已开始 ${minutes} 分钟休息计时。`);
  });
}
