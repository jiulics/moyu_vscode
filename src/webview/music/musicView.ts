import type { OutgoingMessage } from '../common/messageProtocol';

declare function acquireVsCodeApi(): {
  postMessage(message: unknown): void;
};

type MusicLoadMessage = Extract<OutgoingMessage, { type: 'music.load' }>;
type PlayMode = 'list' | 'single' | 'shuffle';

const vscode = acquireVsCodeApi();
const root = document.getElementById('music-root');
const audio = new Audio();

let tracks: MusicLoadMessage['tracks'] = [];
let currentIndex = 0;
let mode: PlayMode = 'list';

window.addEventListener('message', (event: MessageEvent<OutgoingMessage>) => {
  loadMessage(event.data);
});

loadBootstrapMessage();

audio.addEventListener('play', () => postStatus('playing'));
audio.addEventListener('pause', () => postStatus('paused'));
audio.addEventListener('ended', () => {
  void playNext();
});

function render(): void {
  if (!root) {
    return;
  }

  root.innerHTML = '';
  root.append(createToolbar(), createPlaylist(), createNowPlaying());
}

function createToolbar(): HTMLElement {
  const toolbar = document.createElement('section');
  toolbar.className = 'toolbar';

  const previous = createButton('上一首', () => {
    void playPrevious();
  });
  const play = createButton(audio.paused ? '播放' : '暂停', () => {
    void togglePlay();
  });
  const next = createButton('下一首', () => {
    void playNext();
  });
  const volume = document.createElement('input');
  volume.type = 'range';
  volume.min = '0';
  volume.max = '1';
  volume.step = '0.01';
  volume.value = String(audio.volume);
  volume.title = '音量';
  volume.addEventListener('input', () => {
    audio.volume = Number(volume.value);
  });

  const modeSelect = document.createElement('select');
  for (const item of [
    ['list', '列表循环'],
    ['single', '单曲循环'],
    ['shuffle', '随机播放']
  ] as const) {
    const option = document.createElement('option');
    option.value = item[0];
    option.textContent = item[1];
    option.selected = mode === item[0];
    modeSelect.append(option);
  }
  modeSelect.addEventListener('change', () => {
    mode = modeSelect.value as PlayMode;
  });

  toolbar.append(previous, play, next, volume, modeSelect);
  return toolbar;
}

function createPlaylist(): HTMLElement {
  const list = document.createElement('ol');
  list.className = 'playlist';

  if (tracks.length === 0) {
    const empty = document.createElement('li');
    empty.textContent = '播放列表为空';
    list.append(empty);
    return list;
  }

  tracks.forEach((track, index) => {
    const item = document.createElement('li');
    item.className = index === currentIndex ? 'active' : '';
    const button = createButton(track.title, () => {
      void playAt(index);
    });
    item.append(button);
    list.append(item);
  });

  return list;
}

function createNowPlaying(): HTMLElement {
  const panel = document.createElement('section');
  panel.className = 'now-playing';

  const title = document.createElement('h1');
  title.textContent = tracks[currentIndex]?.title ?? 'Moyu Music';

  const progress = document.createElement('input');
  progress.type = 'range';
  progress.min = '0';
  progress.max = '100';
  progress.value = '0';
  progress.title = '播放进度';
  progress.addEventListener('input', () => {
    if (audio.duration > 0) {
      audio.currentTime = (Number(progress.value) / 100) * audio.duration;
    }
  });

  audio.addEventListener('timeupdate', () => {
    if (audio.duration > 0) {
      progress.value = String((audio.currentTime / audio.duration) * 100);
    }
  });

  panel.append(title, progress);
  return panel;
}

async function togglePlay(): Promise<void> {
  if (audio.paused) {
    await playAt(currentIndex);
  } else {
    audio.pause();
  }
  render();
}

async function playAt(index: number): Promise<void> {
  const track = tracks[index];
  if (!track) {
    return;
  }

  currentIndex = index;
  audio.src = track.uri;
  await audio.play();
  render();
}

async function playPrevious(): Promise<void> {
  if (tracks.length === 0) {
    return;
  }
  currentIndex = (currentIndex - 1 + tracks.length) % tracks.length;
  await playAt(currentIndex);
}

async function playNext(): Promise<void> {
  if (tracks.length === 0) {
    return;
  }

  if (mode === 'single') {
    await playAt(currentIndex);
    return;
  }

  if (mode === 'shuffle') {
    currentIndex = Math.floor(Math.random() * tracks.length);
  } else {
    currentIndex = (currentIndex + 1) % tracks.length;
  }
  await playAt(currentIndex);
}

function createButton(label: string, onClick: () => void): HTMLButtonElement {
  const button = document.createElement('button');
  button.type = 'button';
  button.textContent = label;
  button.addEventListener('click', onClick);
  return button;
}

function postStatus(status: 'playing' | 'paused'): void {
  vscode.postMessage({
    type: 'music.status',
    status,
    title: tracks[currentIndex]?.title
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
  if (message.type !== 'music.load') {
    return;
  }

  tracks = message.tracks;
  audio.volume = message.settings.volume;
  render();
}
