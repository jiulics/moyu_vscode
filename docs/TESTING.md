# Testing

Run the full local verification set:

```powershell
npm run lint
npm run test:unit
npm run test:integration
npm run package
```

## Unit Tests

Unit tests use Vitest and live in `src/test/unit/`.

Covered areas:

- Chapter parsing for Chinese, English, duplicate, and no-heading inputs.
- Text decoding for UTF-8 and GBK buffers.
- Reading progress clamping and bookmark updates.
- Playlist ordering, duplicate updates, clearing, and extension validation.
- Break timer start, replacement, stop, and fake timer behavior.
- Webview message validation through `zod`.

## Integration Tests

Integration tests use `@vscode/test-electron`. `@vscode/test-cli` is kept in the workflow to validate the test configuration before the explicit runner starts VS Code.

The runner clears `ELECTRON_RUN_AS_NODE` and `VSCODE_CWD` before launching VS Code because some terminal sessions inherit those variables from VS Code itself. It also creates a temporary junction without spaces in the path to avoid Windows shell argument splitting in `@vscode/test-electron`.

Integration tests verify:

- The extension is discoverable and activates.
- All core commands are registered.
- Default configuration values are readable.
- File-picker commands can take a cancel-safe test path without throwing.

## Test Fixtures

Fixtures live in `test-fixtures/` and are self-created:

- `novels/simple-utf8.txt`
- `novels/simple-gbk.txt`
- `audio/silent-1s.wav`

Do not commit real novels, downloaded music, private files, logs, or generated `.vsix` files.
