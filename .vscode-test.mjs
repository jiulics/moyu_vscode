import { defineConfig } from '@vscode/test-cli';

export default defineConfig([
  {
    label: 'integration',
    files: 'out/test/integration/**/*.test.js',
    launchArgs: []
  }
]);
