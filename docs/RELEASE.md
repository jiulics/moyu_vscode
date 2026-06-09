# Release

## Local Checklist

```powershell
npm ci
npm run lint
npm run test:unit
npm run test:integration
npm run package
git diff --check
```

## Package

```powershell
npx vsce package
```

The generated `.vsix` is ignored by Git.

## Version

```powershell
npm version patch
git push origin main --tags
```

## Publish

After configuring a Visual Studio Marketplace publisher token:

```powershell
npx vsce publish
```

## Privacy Review

Before publishing, confirm:

- No real novel files are included.
- No real music files are included.
- No secrets or tokens are committed.
- README still states local-only storage behavior.
