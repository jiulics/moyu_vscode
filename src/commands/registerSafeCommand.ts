import * as vscode from 'vscode';

export function registerSafeCommand(
  command: string,
  callback: (...args: unknown[]) => Promise<void> | void
): vscode.Disposable {
  return vscode.commands.registerCommand(command, (...args: unknown[]) => {
    Promise.resolve(callback(...args)).catch((error: unknown) => {
      void vscode.window.showErrorMessage(formatError(error));
    });
  });
}

function formatError(error: unknown): string {
  return error instanceof Error ? error.message : 'Moyu 执行命令时遇到未知错误。';
}
