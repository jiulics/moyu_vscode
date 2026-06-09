export interface Chapter {
  id: string;
  index: number;
  title: string;
  startOffset: number;
  endOffset: number;
  content: string;
}

const chapterHeadingPattern =
  /^[ \t]*(第[0-9零一二三四五六七八九十百千万两]+[章节回卷部篇][^\r\n]*|卷[0-9零一二三四五六七八九十百千万两]+[^\r\n]*|chapter\s+[0-9]+[^\r\n]*)[ \t]*$/gim;

export function parseChapters(text: string): Chapter[] {
  const matches = [...text.matchAll(chapterHeadingPattern)];

  if (matches.length === 0) {
    return [
      {
        id: 'chapter-0',
        index: 0,
        title: '全文',
        startOffset: 0,
        endOffset: text.length,
        content: text
      }
    ];
  }

  return matches.map((match, index) => {
    const title = (match[1] ?? '未命名章节').trim();
    const startOffset = match.index ?? 0;
    const nextMatch = matches[index + 1];
    const endOffset = nextMatch?.index ?? text.length;

    return {
      id: `chapter-${index}`,
      index,
      title,
      startOffset,
      endOffset,
      content: text.slice(startOffset, endOffset).trim()
    };
  });
}
