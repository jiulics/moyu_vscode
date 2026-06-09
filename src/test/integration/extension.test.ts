import * as assert from 'node:assert/strict';
import * as vscode from 'vscode';

suite('Moyu extension', () => {
  test('activates and registers core commands', async () => {
    const extension = vscode.extensions.getExtension('jiulics.moyu-vscode');

    assert.ok(extension, 'extension should be discoverable');
    await extension.activate();

    const commands = await vscode.commands.getCommands(true);
    for (const command of [
      'moyu.addNovel',
      'moyu.openReader',
      'moyu.showNovelLibrary',
      'moyu.addMusicFiles',
      'moyu.openMusicPlayer',
      'moyu.clearPlaylist',
      'moyu.openExternalService',
      'moyu.importFanqieExport',
      'moyu.startBreakTimer',
      'moyu.stopBreakTimer'
    ]) {
      assert.ok(commands.includes(command), `${command} should be registered`);
    }
  });

  test('reads default configuration values', () => {
    const config = vscode.workspace.getConfiguration('moyu');

    assert.equal(config.get('reader.fontSize'), 18);
    assert.equal(config.get('reader.theme'), 'dark');
    assert.equal(config.get('music.volume'), 0.7);
    assert.equal(config.get('break.defaultMinutes'), 5);
    assert.equal(config.get('external.fanqieDownloaderBaseUrl'), 'http://127.0.0.1:5000');
  });

  test('handles cancel-safe commands without throwing', async () => {
    await assert.doesNotReject(
      Promise.resolve(vscode.commands.executeCommand('moyu.addNovel', { skipDialog: true }))
    );
    await assert.doesNotReject(
      Promise.resolve(vscode.commands.executeCommand('moyu.addMusicFiles', { skipDialog: true }))
    );
    await assert.doesNotReject(
      Promise.resolve(vscode.commands.executeCommand('moyu.importFanqieExport', { skipDialog: true }))
    );
  });
});
