import { describe, expect, it } from 'vitest';
import iconv from 'iconv-lite';

import { decodeTextBuffer } from '../../services/novel/encodingDetector';

describe('decodeTextBuffer', () => {
  it('decodes utf-8 buffers', () => {
    const result = decodeTextBuffer(Buffer.from('第一章 你好', 'utf8'));

    expect(result.text).toBe('第一章 你好');
    expect(result.encoding).toBe('UTF-8');
  });

  it('decodes gbk buffers', () => {
    const result = decodeTextBuffer(iconv.encode('第一章 你好', 'gbk'));

    expect(result.text).toBe('第一章 你好');
    expect(['GB18030', 'GBK']).toContain(result.encoding);
  });

  it('throws a clear error for empty buffers', () => {
    expect(() => decodeTextBuffer(Buffer.alloc(0))).toThrow('Cannot decode an empty text file.');
  });
});
