import path from 'node:path';
import os from 'node:os';
import { rm, symlink } from 'node:fs/promises';
import { runTests } from '@vscode/test-electron';

const realRoot = process.cwd();
const safeRoot = path.join(os.tmpdir(), `moyu-vscode-test-${process.pid}`);

delete process.env.ELECTRON_RUN_AS_NODE;
delete process.env.VSCODE_CWD;

await symlink(realRoot, safeRoot, 'junction');

try {
  await runTests({
    extensionDevelopmentPath: safeRoot,
    extensionTestsPath: path.join(safeRoot, 'out', 'test', 'integration', 'suite', 'index.js'),
    launchArgs: [path.join(safeRoot, 'test-workspace')]
  });
} finally {
  await rm(safeRoot, { force: true, recursive: true });
}
