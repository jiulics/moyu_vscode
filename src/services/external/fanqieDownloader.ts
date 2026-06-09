export interface FanqieDownloaderResult {
  label: string;
  description: string;
  novelId: string;
}

interface FanqieDownloaderBook {
  book_id?: unknown;
  book_name?: unknown;
  author?: unknown;
  word_number?: unknown;
}

interface FanqieDownloaderSearchItem {
  book_data?: unknown;
}

export function buildFanqieDownloaderSearchUri(baseUrl: string, keyword: string): URL {
  const uri = new URL('/api/search', normalizeBaseUrl(baseUrl));
  uri.searchParams.set('keyword', keyword.trim());
  return uri;
}

export function buildFanqieDownloaderDownloadUri(baseUrl: string, novelId: string): URL {
  return new URL(`/api/download/${encodeURIComponent(novelId.trim())}`, normalizeBaseUrl(baseUrl));
}

export function normalizeFanqieDownloaderResults(response: unknown): FanqieDownloaderResult[] {
  if (!Array.isArray(response)) {
    return [];
  }

  return response
    .map((item) => firstBook(item))
    .filter((book): book is FanqieDownloaderBook => Boolean(book))
    .map((book) => {
      const novelId = getString(book.book_id);
      const title = getString(book.book_name);
      if (!novelId || !title) {
        return undefined;
      }

      return {
        label: title,
        description: [getString(book.author), getString(book.word_number)]
          .filter(Boolean)
          .join(' · '),
        novelId
      };
    })
    .filter((result): result is FanqieDownloaderResult => Boolean(result));
}

function normalizeBaseUrl(baseUrl: string): string {
  const trimmed = baseUrl.trim() || 'http://127.0.0.1:5000';
  return trimmed.endsWith('/') ? trimmed : `${trimmed}/`;
}

function firstBook(item: unknown): FanqieDownloaderBook | undefined {
  const record = asRecord(item) as FanqieDownloaderSearchItem;
  if (!Array.isArray(record.book_data)) {
    return undefined;
  }

  return asRecord(record.book_data[0]);
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' ? (value as Record<string, unknown>) : {};
}

function getString(value: unknown): string | undefined {
  if (typeof value === 'string') {
    return value.trim() || undefined;
  }

  if (typeof value === 'number') {
    return String(value);
  }

  return undefined;
}
