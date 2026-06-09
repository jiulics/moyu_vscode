import type { OutgoingMessage } from '../common/messageProtocol';

declare function acquireVsCodeApi(): {
  postMessage(message: unknown): void;
};

const vscode = acquireVsCodeApi();
const root = document.getElementById('reader-root');

let state: Extract<OutgoingMessage, { type: 'reader.load' }> | undefined;
let currentChapterIndex = 0;

window.addEventListener('message', (event: MessageEvent<OutgoingMessage>) => {
  loadMessage(event.data);
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
    currentChapterIndex = Number(chapterSelect.value);
    saveProgress(0);
    render();
  });

  const previous = createButton('上一章', () => {
    currentChapterIndex = Math.max(0, currentChapterIndex - 1);
    saveProgress(0);
    render();
  });

  const next = createButton('下一章', () => {
    const lastIndex = (state?.chapters.length ?? 1) - 1;
    currentChapterIndex = Math.min(lastIndex, currentChapterIndex + 1);
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

  toolbar.append(title, chapterSelect, previous, next, bookmark);
  return toolbar;
}

function createContent(content: string): HTMLElement {
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
  render();
}
