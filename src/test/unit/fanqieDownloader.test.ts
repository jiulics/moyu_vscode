import { describe, expect, it } from 'vitest';

import {
  buildFanqieDownloaderDownloadUri,
  buildFanqieDownloaderSearchUri,
  normalizeFanqieDownloaderResults
} from '../../services/external/fanqieDownloader';

describe('fanqieDownloader', () => {
  it('builds local Fanqie downloader search urls', () => {
    const uri = buildFanqieDownloaderSearchUri('http://127.0.0.1:5000/', '修仙');

    expect(uri.toString()).toBe('http://127.0.0.1:5000/api/search?keyword=%E4%BF%AE%E4%BB%99');
  });

  it('builds local Fanqie downloader download urls', () => {
    const uri = buildFanqieDownloaderDownloadUri('http://127.0.0.1:5000', '7143038691944959011');

    expect(uri.toString()).toBe('http://127.0.0.1:5000/api/download/7143038691944959011');
  });

  it('normalizes search responses from ying-ck/fanqienovel-downloader', () => {
    const results = normalizeFanqieDownloaderResults([
      {
        book_data: [
          {
            book_id: '7143038691944959011',
            book_name: '测试小说',
            author: '测试作者',
            word_number: '100万字'
          }
        ]
      }
    ]);

    expect(results).toEqual([
      {
        label: '测试小说',
        description: '测试作者 · 100万字',
        novelId: '7143038691944959011'
      }
    ]);
  });

  it('ignores malformed search results', () => {
    expect(
      normalizeFanqieDownloaderResults([{ book_data: [] }, { book_data: [{ book_name: '无 ID' }] }])
    ).toEqual([]);
  });
});
