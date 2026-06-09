export function getNextPageIndex(currentPageIndex: number, pageCount: number): number {
  return Math.min(Math.max(0, pageCount - 1), currentPageIndex + 1);
}

export function getPreviousPageIndex(currentPageIndex: number): number {
  return Math.max(0, currentPageIndex - 1);
}

export function getPageIndexAfterChapterChange(
  previousChapterIndex: number,
  nextChapterIndex: number,
  currentPageIndex: number
): number {
  if (previousChapterIndex !== nextChapterIndex) {
    return 0;
  }

  return Math.max(0, Math.trunc(currentPageIndex));
}

export function calculatePageProgress(pageIndex: number, pageCount: number): number {
  if (pageCount <= 1) {
    return 0;
  }

  return Math.min(100, Math.max(0, (pageIndex / (pageCount - 1)) * 100));
}

export function splitContentIntoPages(content: string, charsPerPage: number): string[] {
  const normalized = content.trim();
  if (!normalized) {
    return [''];
  }

  const size = Math.max(120, Math.trunc(charsPerPage));
  const pages: string[] = [];
  for (let index = 0; index < normalized.length; index += size) {
    pages.push(normalized.slice(index, index + size));
  }
  return pages;
}
