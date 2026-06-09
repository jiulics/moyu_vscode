import { describe, expect, it } from 'vitest';

import { parseIncomingMessage, parseOutgoingMessage } from '../../webview/common/messageProtocol';

describe('messageProtocol', () => {
  it('accepts a valid reader progress message', () => {
    const message = parseIncomingMessage({
      type: 'reader.saveProgress',
      novelUri: 'file:///novel.txt',
      chapterIndex: 1,
      scrollPercent: 30
    });

    expect(message.type).toBe('reader.saveProgress');
  });

  it('rejects unknown incoming messages', () => {
    expect(() => parseIncomingMessage({ type: 'unknown' })).toThrow();
  });

  it('accepts an outgoing reader load message', () => {
    const message = parseOutgoingMessage({
      type: 'reader.load',
      novelUri: 'file:///novel.txt',
      title: 'Novel',
      chapters: [],
      progress: undefined,
      settings: { fontSize: 18, lineHeight: 1.8, theme: 'dark' }
    });

    expect(message.type).toBe('reader.load');
  });
});
