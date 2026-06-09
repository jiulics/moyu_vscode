import { describe, expect, it } from 'vitest';

import { parseFanqieJsonExport } from '../../services/external/fanqieExport';

describe('parseFanqieJsonExport', () => {
  it('converts common chapter json into readable text', () => {
    const result = parseFanqieJsonExport(
      JSON.stringify({
        bookName: '测试书',
        chapters: [
          { title: '第一章 开始', content: '正文一' },
          { chapter_title: '第二章 继续', text: '正文二' }
        ]
      }),
      'fallback'
    );

    expect(result.title).toBe('测试书');
    expect(result.text).toContain('第一章 开始');
    expect(result.text).toContain('正文二');
  });

  it('falls back to raw json text when no chapter list exists', () => {
    const result = parseFanqieJsonExport('{"record":[1]}', '导出文件');

    expect(result.title).toBe('导出文件');
    expect(result.text).toBe('{"record":[1]}');
  });

  it('does not treat book metadata strings as chapter maps', () => {
    const result = parseFanqieJsonExport('{"title":"只有元数据"}', '导出文件');

    expect(result.title).toBe('只有元数据');
    expect(result.text).toBe('{"title":"只有元数据"}');
  });

  it('converts Fanqie downloader chapter maps into readable text', () => {
    const result = parseFanqieJsonExport(
      JSON.stringify({
        _metadata: {
          novel_id: 123,
          total_chapters: 2
        },
        chapters: {
          '第一章 起点': '正文一',
          '第二章 转折': '正文二'
        }
      }),
      '番茄导出'
    );

    expect(result.title).toBe('番茄导出');
    expect(result.text).toBe('第一章 起点\n\n正文一\n\n第二章 转折\n\n正文二');
    expect(result.text).not.toContain('_metadata');
  });

  it('converts top-level Fanqie downloader chapter maps into readable text', () => {
    const result = parseFanqieJsonExport(
      JSON.stringify({
        '第一章 直接导出': '正文一',
        '第二章 继续导出': '正文二'
      }),
      '顶层映射'
    );

    expect(result.title).toBe('顶层映射');
    expect(result.text).toBe('第一章 直接导出\n\n正文一\n\n第二章 继续导出\n\n正文二');
  });
});
