import chardet from 'chardet';
import iconv from 'iconv-lite';

export interface DecodedText {
  encoding: string;
  text: string;
}

const supportedEncodings = new Map<string, string>([
  ['UTF-8', 'utf8'],
  ['UTF8', 'utf8'],
  ['ASCII', 'utf8'],
  ['GBK', 'gbk'],
  ['GB18030', 'gb18030'],
  ['GB2312', 'gbk'],
  ['BIG5', 'big5']
]);

export function decodeTextBuffer(buffer: Buffer | Uint8Array): DecodedText {
  const source = Buffer.isBuffer(buffer) ? buffer : Buffer.from(buffer);

  if (source.byteLength === 0) {
    throw new Error('Cannot decode an empty text file.');
  }

  if (looksLikeUtf8(source)) {
    return { encoding: 'UTF-8', text: source.toString('utf8') };
  }

  const detected = normalizeEncoding(chardet.detect(source));
  const iconvEncoding = supportedEncodings.get(detected) ?? 'gb18030';
  const text = iconv.decode(source, iconvEncoding);

  return {
    encoding: iconvEncoding === 'gb18030' ? 'GB18030' : detected,
    text
  };
}

function normalizeEncoding(encoding: string | null | undefined): string {
  return encoding?.toUpperCase().replace(/[-_\s]/g, '') ?? 'GB18030';
}

function looksLikeUtf8(buffer: Buffer): boolean {
  const decoded = buffer.toString('utf8');
  return !decoded.includes('\uFFFD');
}
