export interface FanqieParsedExport {
  title: string;
  text: string;
}

interface FanqieChapterLike {
  title?: unknown;
  chapter_title?: unknown;
  name?: unknown;
  content?: unknown;
  text?: unknown;
  body?: unknown;
}

interface FanqieBookLike {
  title?: unknown;
  bookName?: unknown;
  book_name?: unknown;
  name?: unknown;
  chapters?: unknown;
  chapterList?: unknown;
  list?: unknown;
}

const metadataKeys = new Set([
  '_metadata',
  'title',
  'bookName',
  'book_name',
  'name',
  'author',
  'authorName',
  'description',
  'abstract',
  'status',
  'novel_id',
  'book_id',
  'download_time',
  'total_chapters',
  'completed_chapters',
  'failed_chapters'
]);

export function parseFanqieJsonExport(rawText: string, fallbackTitle: string): FanqieParsedExport {
  const parsed = JSON.parse(rawText) as unknown;
  const book = normalizeBook(parsed);
  const chapters = normalizeChapters(book);

  if (chapters.length === 0) {
    return {
      title: book.title,
      text: rawText
    };
  }

  return {
    title: book.title,
    text: chapters
      .map((chapter, index) => {
        const title = chapter.title.trim() || `第${index + 1}章`;
        return `${title}\n\n${chapter.content.trim()}`;
      })
      .join('\n\n')
  };

  function normalizeBook(value: unknown): { title: string; chapters: unknown } {
    const object = asRecord(value);
    const title =
      getString(object.title) ??
      getString(object.bookName) ??
      getString(object.book_name) ??
      getString(object.name) ??
      fallbackTitle;
    const chapterSource =
      object.chapters ??
      object.chapterList ??
      object.list ??
      (Array.isArray(value) || isChapterMap(value) ? value : undefined);

    return {
      title,
      chapters: chapterSource
    };
  }
}

function normalizeChapters(book: { chapters: unknown }): Array<{ title: string; content: string }> {
  if (Array.isArray(book.chapters)) {
    return book.chapters
      .map((chapter) => {
        const object = asRecord(chapter) as FanqieChapterLike;
        return {
          title:
            getString(object.title) ??
            getString(object.chapter_title) ??
            getString(object.name) ??
            '',
          content:
            getString(object.content) ??
            getString(object.text) ??
            getString(object.body) ??
            ''
        };
      })
      .filter((chapter) => chapter.title || chapter.content);
  }

  if (isChapterMap(book.chapters)) {
    return Object.entries(book.chapters)
      .filter(([title, content]) => !isMetadataKey(title) && typeof content === 'string')
      .map(([title, content]) => ({
        title,
        content
      }));
  }

  return [];
}

function asRecord(value: unknown): FanqieBookLike & Record<string, unknown> {
  return value && typeof value === 'object' ? (value as FanqieBookLike & Record<string, unknown>) : {};
}

function getString(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim() ? value : undefined;
}

function isChapterMap(value: unknown): value is Record<string, string> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return false;
  }

  return Object.entries(value).some(
    ([key, content]) =>
      !isMetadataKey(key) && typeof content === 'string' && content.trim().length > 0
  );
}

function isMetadataKey(key: string): boolean {
  return metadataKeys.has(key);
}
