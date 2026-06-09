import { describe, expect, it } from 'vitest';

import { parseChapters } from '../../services/novel/chapterParser';

describe('parseChapters', () => {
  it('parses Chinese numeric chapter headings', () => {
    const chapters = parseChapters('序章\n第1章 开始\n正文一\n第二章 转折\n正文二');

    expect(chapters).toHaveLength(2);
    expect(chapters[0]).toMatchObject({ index: 0, title: '第1章 开始' });
    expect(chapters[1]).toMatchObject({ index: 1, title: '第二章 转折' });
    expect(chapters[0]?.content).toContain('正文一');
  });

  it('parses volume and English chapter headings', () => {
    const chapters = parseChapters('卷一 初见\n内容\nChapter 2 Return\nmore');

    expect(chapters.map((chapter) => chapter.title)).toEqual(['卷一 初见', 'Chapter 2 Return']);
  });

  it('returns a full-text fallback chapter when no heading exists', () => {
    const text = '只有正文\n没有章节';
    const chapters = parseChapters(text);

    expect(chapters).toEqual([
      {
        id: 'chapter-0',
        index: 0,
        title: '全文',
        startOffset: 0,
        endOffset: text.length,
        content: text
      }
    ]);
  });

  it('keeps duplicate headings as separate chapters with stable ids', () => {
    const chapters = parseChapters('第1章 重复\nA\n第1章 重复\nB');

    expect(chapters).toHaveLength(2);
    expect(chapters.map((chapter) => chapter.id)).toEqual(['chapter-0', 'chapter-1']);
    expect(chapters[1]?.content).toContain('B');
  });
});
