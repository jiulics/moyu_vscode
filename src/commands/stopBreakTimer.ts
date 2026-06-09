import * as vscode from 'vscode';

import { registerSafeCommand } from './registerSafeCommand';
import type { MoyuCommandDependencies } from './types';

export function registerStopBreakTimerCommand(dependencies: MoyuCommandDependencies): vscode.Disposable {
  return registerSafeCommand('moyu.stopBreakTimer', () => {
    dependencies.breakTimer.stop();
    dependencies.breakTimerProvider.refresh();
    void vscode.window.showInformationMessage('Moyu 已停止休息计时。');
  });
}
