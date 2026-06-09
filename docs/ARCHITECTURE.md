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
- `break/` handles the timer and daily local stats.
- `storage/` adapts VS Code `Memento` to a small JSON store interface.

## Webviews

`src/webview/` contains panel setup, CSP helpers, message protocol validation, and browser-side scripts. Messages between the extension host and webviews are validated with `zod`.

Security rules:

- Webviews use a restrictive Content Security Policy.
- Scripts require a nonce.
- Reader webviews only load extension-owned resources.
- Music webviews only expose extension-owned resources and folders for user-selected audio.

## Data Storage

All user data stays local in VS Code global extension storage:

- `moyu.novelLibrary`
- `moyu.readingProgress`
- `moyu.playlist`
- `moyu.breakStats`

No network sync or remote content source is used.
