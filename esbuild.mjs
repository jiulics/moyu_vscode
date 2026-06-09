import esbuild from 'esbuild';
import { mkdir, cp } from 'node:fs/promises';
import { argv } from 'node:process';

const watch = argv.includes('--watch');
const production = argv.includes('--production');

const common = {
  bundle: true,
  minify: production,
  sourcemap: !production,
  sourcesContent: false,
  platform: 'node',
  target: 'node20',
  logLevel: 'info'
};

async function copyStaticAssets() {
  await mkdir('dist/webview/reader', { recursive: true });
  await mkdir('dist/webview/music', { recursive: true });
  await mkdir('dist/media/icons', { recursive: true });
  await cp('src/webview/reader/readerView.css', 'dist/webview/reader/readerView.css');
  await cp('src/webview/music/musicView.css', 'dist/webview/music/musicView.css');
  await cp('media/icons/moyu.svg', 'dist/media/icons/moyu.svg');
}

async function build() {
  await copyStaticAssets();
  const context = await esbuild.context({
    ...common,
    entryPoints: {
      extension: 'src/extension.ts',
      'webview/reader/readerView': 'src/webview/reader/readerView.ts',
      'webview/music/musicView': 'src/webview/music/musicView.ts'
    },
    outdir: 'dist',
    external: ['vscode']
  });

  if (watch) {
    await context.watch();
  } else {
    await context.rebuild();
    await context.dispose();
  }
}

build().catch((error) => {
  console.error(error);
  process.exit(1);
});
