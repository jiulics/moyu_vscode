import type { OutgoingMessage } from '../common/messageProtocol';
import {
  calculatePageProgress,
  getNextPageIndex,
  getPageIndexAfterChapterChange,
  getPreviousPageIndex,
  splitContentIntoPages
} from './pageTurn';

declare function acquireVsCodeApi(): {
  postMessage(message: unknown): void;
};

const vscode = acquireVsCodeApi();
const root = document.getElementById('reader-root');

let state: Extract<OutgoingMessage, { type: 'reader.load' }> | undefined;
let currentChapterIndex = 0;
let readingMode: 'scroll' | 'page' = 'scroll';
let currentPageIndex = 0;

window.addEventListener('message', (event: MessageEvent<OutgoingMessage>) => {
  loadMessage(event.data);
});

window.addEventListener('keydown', (event) => {
  if (readingMode !== 'page') {
    return;
  }

  if (event.key === 'ArrowLeft') {
    previousPage();
  }

  if (event.key === 'ArrowRight' || event.key === ' ') {
    nextPage();
  }
});

window.addEventListener('resize', () => {
  if (readingMode === 'page') {
    render();
  }
});

loadBootstrapMessage();

function render(): void {
  if (!root || !state) {
    return;
  }

  const chapter = state.chapters[currentChapterIndex] ?? state.chapters[0];
  if (!chapter) {
    root.textContent = '没有可显示的内容';
    return;
  }

  document.body.className = `theme-${state.settings.theme}`;
  document.body.style.setProperty('--reader-font-size', `${state.settings.fontSize}px`);
  document.body.style.setProperty('--reader-line-height', String(state.settings.lineHeight));

  root.innerHTML = '';
  root.append(createToolbar(), createContent(chapter.content));
}

function createToolbar(): HTMLElement {
  const toolbar = document.createElement('section');
  toolbar.className = 'toolbar';

  const title = document.createElement('h1');
  title.textContent = state?.title ?? 'Moyu Reader';

  const chapterSelect = document.createElement('select');
  chapterSelect.title = '章节';
  for (const chapter of state?.chapters ?? []) {
    const option = document.createElement('option');
    option.value = String(chapter.index);
    option.textContent = chapter.title;
    option.selected = chapter.index === currentChapterIndex;
    chapterSelect.append(option);
  }
  chapterSelect.addEventListener('change', () => {
    const nextChapterIndex = Number(chapterSelect.value);
    currentPageIndex = getPageIndexAfterChapterChange(
      currentChapterIndex,
      nextChapterIndex,
      currentPageIndex
    );
    currentChapterIndex = nextChapterIndex;
    saveProgress(0);
    render();
  });

  const previous = createButton('上一章', () => {
    const nextChapterIndex = Math.max(0, currentChapterIndex - 1);
    currentPageIndex = getPageIndexAfterChapterChange(
      currentChapterIndex,
      nextChapterIndex,
      currentPageIndex
    );
    currentChapterIndex = nextChapterIndex;
    saveProgress(0);
    render();
  });

  const next = createButton('下一章', () => {
    const lastIndex = (state?.chapters.length ?? 1) - 1;
    const nextChapterIndex = Math.min(lastIndex, currentChapterIndex + 1);
    currentPageIndex = getPageIndexAfterChapterChange(
      currentChapterIndex,
      nextChapterIndex,
      currentPageIndex
    );
    currentChapterIndex = nextChapterIndex;
    saveProgress(0);
    render();
  });

  const bookmark = createButton('书签', () => {
    vscode.postMessage({
      type: 'reader.addBookmark',
      novelUri: state?.novelUri,
      chapterIndex: currentChapterIndex,
      label: state?.chapters[currentChapterIndex]?.title ?? '书签'
    });
  });

  const modeToggle = createButton(readingMode === 'page' ? '滚动' : '翻页', () => {
    readingMode = readingMode === 'page' ? 'scroll' : 'page';
    currentPageIndex = progressToPageIndex(state?.progress?.scrollPercent ?? 0, getCurrentPageCount());
    render();
  });

  toolbar.append(title, chapterSelect, previous, next, modeToggle, bookmark);
  return toolbar;
}

function createContent(content: string): HTMLElement {
  if (readingMode === 'page') {
    return createPagedContent(content);
  }

  const article = document.createElement('article');
  article.className = 'content';
  article.textContent = content;
  article.addEventListener('scroll', () => {
    const denominator = Math.max(1, article.scrollHeight - article.clientHeight);
    saveProgress((article.scrollTop / denominator) * 100);
  });

  requestAnimationFrame(() => {
    const progress = state?.progress;
    if (progress && progress.chapterIndex === currentChapterIndex) {
      const denominator = Math.max(1, article.scrollHeight - article.clientHeight);
      article.scrollTop = (progress.scrollPercent / 100) * denominator;
    }
  });

  return article;
}

function createPagedContent(content: string): HTMLElement {
  const article = document.createElement('article');
  article.className = 'content page-content';

  const pages = splitContentIntoPages(content, getCharsPerPage());
  currentPageIndex = Math.min(currentPageIndex, pages.length - 1);
  article.textContent = pages[currentPageIndex] ?? '';

  const previousZone = document.createElement('button');
  previousZone.type = 'button';
  previousZone.className = 'page-zone page-zone-left';
  previousZone.title = '上一页';
  previousZone.textContent = '‹';
  previousZone.addEventListener('click', previousPage);

  const nextZone = document.createElement('button');
  nextZone.type = 'button';
  nextZone.className = 'page-zone page-zone-right';
  nextZone.title = '下一页';
  nextZone.textContent = '›';
  nextZone.addEventListener('click', nextPage);

  const pageIndicator = document.createElement('span');
  pageIndicator.className = 'page-indicator';
  pageIndicator.textContent = `${currentPageIndex + 1}/${pages.length}`;

  const shell = document.createElement('section');
  shell.className = 'page-shell';
  shell.append(article, previousZone, nextZone, pageIndicator);
  saveProgress(calculatePageProgress(currentPageIndex, pages.length));

  return shell;
}

function createButton(label: string, onClick: () => void): HTMLButtonElement {
  const button = document.createElement('button');
  button.type = 'button';
  button.textContent = label;
  button.addEventListener('click', onClick);
  return button;
}

function saveProgress(scrollPercent: number): void {
  if (!state) {
    return;
  }

  vscode.postMessage({
    type: 'reader.saveProgress',
    novelUri: state.novelUri,
    chapterIndex: currentChapterIndex,
    scrollPercent: Math.min(100, Math.max(0, scrollPercent))
  });
}

function nextPage(): void {
  const pageCount = getCurrentPageCount();
  currentPageIndex = getNextPageIndex(currentPageIndex, pageCount);
  saveProgress(calculatePageProgress(currentPageIndex, pageCount));
  render();
}

function previousPage(): void {
  const pageCount = getCurrentPageCount();
  currentPageIndex = getPreviousPageIndex(currentPageIndex);
  saveProgress(calculatePageProgress(currentPageIndex, pageCount));
  render();
}

function loadBootstrapMessage(): void {
  const element = document.getElementById('moyu-bootstrap');
  if (!element?.textContent) {
    return;
  }

  loadMessage(JSON.parse(element.textContent) as OutgoingMessage);
}

function loadMessage(message: OutgoingMessage): void {
  if (message.type !== 'reader.load') {
    return;
  }

  state = message;
  currentChapterIndex = state.progress?.chapterIndex ?? 0;
  currentPageIndex = progressToPageIndex(state.progress?.scrollPercent ?? 0, getCurrentPageCount());
  render();
}

function getCurrentPageCount(): number {
  const content = state?.chapters[currentChapterIndex]?.content ?? '';
  return splitContentIntoPages(content, getCharsPerPage()).length;
}

function getCharsPerPage(): number {
  const width = Math.max(240, window.innerWidth);
  const height = Math.max(320, window.innerHeight - 72);
  const fontSize = state?.settings.fontSize ?? 18;
  const lineHeight = fontSize * (state?.settings.lineHeight ?? 1.8);
  const charsPerLine = Math.max(10, Math.floor((width - 56) / (fontSize * 0.9)));
  const linesPerPage = Math.max(6, Math.floor((height - 48) / lineHeight));
  return charsPerLine * linesPerPage;
}

function progressToPageIndex(progress: number, pageCount: number): number {
  if (pageCount <= 1) {
    return 0;
  }

  return Math.min(pageCount - 1, Math.max(0, Math.round((progress / 100) * (pageCount - 1))));
}
