# Moyu

摸鱼插件：一个用于在 VS Code 内阅读本地小说、播放本地音乐和进行短休息计时的轻量工具箱。

Moyu is a lightweight VS Code extension for short breaks inside the editor. It can read local novels, play local music, and start short break timers.

## Features

- Add local `.txt` and `.md` novels.
- Read with chapter navigation, progress persistence, bookmarks, and reader themes.
- Read in the full reader or the compact side bar mini reader.
- Switch between scroll reading and app-style page turning.
- Add local `.mp3`, `.wav`, `.ogg`, `.m4a`, and `.flac` files.
- Play music in a VS Code webview with volume, progress, and play mode controls.
- Search official external services: QQ Music web search, Open Library API, and MusicBrainz API.
- Connect to a user-run local `fanqienovel-downloader` Web service to search Fanqie novels and trigger downloads.
- Import local Fanqie export files (`.txt`, `.md`, `.json`) without bundling platform scraping logic. JSON imports support chapter arrays and common `{ chapterTitle: content }` maps produced by external tools.
- Start 5, 10, or 15 minute break timers.
- Keep all data local in VS Code extension storage.

## Commands

- `Moyu: Add Novel`
- `Moyu: Open Reader`
- `Moyu: Show Novel Library`
- `Moyu: Add Music Files`
- `Moyu: Open Music Player`
- `Moyu: Clear Playlist`
- `Moyu: Open External Service`
- `Moyu: Import Fanqie Export`
- `Moyu: Start Break Timer`
- `Moyu: Stop Break Timer`

## Settings

- `moyu.reader.fontSize`
- `moyu.reader.lineHeight`
- `moyu.reader.theme`
- `moyu.music.volume`
- `moyu.break.defaultMinutes`
- `moyu.external.fanqieDownloaderBaseUrl`

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
