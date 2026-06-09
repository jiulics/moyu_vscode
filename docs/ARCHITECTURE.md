# Architecture

Moyu is split into four small layers.

## Extension Host

`src/extension.ts` owns activation and disposal. It creates stores, side bar providers, the break timer, the status bar item, and command registrations. It should not contain business logic.

## Commands

`src/commands/` contains one file per command. Commands validate user input, call services, refresh views, and open webview panels. Commands are registered through `registerSafeCommand` so user-facing errors are shown with `showErrorMessage`.

## Services

`src/services/` contains business logic that can be unit tested without VS Code:

- `novel/` handles encoding, chapter parsing, library entries, and reading progress.
- `music/` handles supported audio formats, playlist persistence, and status bar state.
- `external/` handles official service URLs, public API result normalization, local Fanqie downloader API adaptation, and local Fanqie export parsing.
- `break/` handles the timer and daily local stats.
- `storage/` adapts VS Code `Memento` to a small JSON store interface.

## Webviews

`src/webview/` contains panel setup, CSP helpers, message protocol validation, and browser-side scripts. Messages between the extension host and webviews are validated with `zod`.

Security rules:

- Webviews use a restrictive Content Security Policy.
- Scripts require a nonce.
- Reader webviews only load extension-owned resources.
- The mini reader is a side bar webview view that reuses the reader webview bundle.
- Music webviews only expose extension-owned resources and folders for user-selected audio.

## External Services

Moyu integrates services through official/public surfaces or user-run local tools:

- QQ Music opens the official web search page.
- Open Library uses the official `search.json` API and opens selected official pages.
- MusicBrainz uses the official recording search API and opens selected official pages.
- Fanqie Novel has no public official API in this implementation. Moyu can call a user-run local `fanqienovel-downloader` Web service at `moyu.external.fanqieDownloaderBaseUrl` for `/api/search` and `/api/download/{id}`, then imports local export files produced by that tool. Supported JSON shapes include chapter arrays and `{ chapterTitle: content }` maps.

## Data Storage

All user data stays local in VS Code global extension storage:

- `moyu.novelLibrary`
- `moyu.readingProgress`
- `moyu.playlist`
- `moyu.breakStats`

No network sync or remote content source is used.
