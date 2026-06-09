# Moyu

摸鱼插件：一个用于在 VS Code 内阅读本地小说、播放本地音乐和进行短休息计时的轻量工具箱。

Moyu is a lightweight VS Code extension for short breaks inside the editor. It can read local novels, play local music, and start short break timers.

## Features

- Add local `.txt` and `.md` novels.
- Read with chapter navigation, progress persistence, bookmarks, and reader themes.
- Add local `.mp3`, `.wav`, `.ogg`, `.m4a`, and `.flac` files.
- Play music in a VS Code webview with volume, progress, and play mode controls.
- Start 5, 10, or 15 minute break timers.
- Keep all data local in VS Code extension storage.

## Commands

- `Moyu: Add Novel`
- `Moyu: Open Reader`
- `Moyu: Show Novel Library`
- `Moyu: Add Music Files`
- `Moyu: Open Music Player`
- `Moyu: Clear Playlist`
- `Moyu: Start Break Timer`
- `Moyu: Stop Break Timer`

## Settings

- `moyu.reader.fontSize`
- `moyu.reader.lineHeight`
- `moyu.reader.theme`
- `moyu.music.volume`
- `moyu.break.defaultMinutes`

## Development

```powershell
npm install
npm run compile
npm run lint
npm run test:unit
npm run test:integration
npm run package
```

See:

- `docs/ARCHITECTURE.md`
- `docs/TESTING.md`
- `docs/RELEASE.md`
- `docs/IMPLEMENTATION_PLAN.md`

## Privacy

Moyu only reads files selected by the user. It does not upload novels, audio files, progress, playlists, or break statistics.
