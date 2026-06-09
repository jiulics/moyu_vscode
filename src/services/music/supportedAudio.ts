const supportedAudioExtensions = new Set(['.mp3', '.wav', '.ogg', '.m4a', '.flac']);

export function isSupportedAudioFile(uriOrName: string): boolean {
  return supportedAudioExtensions.has(getExtension(uriOrName));
}

export function getSupportedAudioExtensions(): string[] {
  return [...supportedAudioExtensions];
}

function getExtension(uriOrName: string): string {
  const cleanPath = decodeURIComponent(uriOrName.split('?')[0] ?? uriOrName).toLowerCase();
  const dotIndex = cleanPath.lastIndexOf('.');
  return dotIndex >= 0 ? cleanPath.slice(dotIndex) : '';
}
