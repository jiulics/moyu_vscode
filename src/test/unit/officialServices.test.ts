import { describe, expect, it } from 'vitest';

import {
  buildOfficialServiceSearchUri,
  normalizeMusicBrainzRecordings,
  normalizeOpenLibraryWorks
} from '../../services/external/officialServices';

describe('officialServices', () => {
  it('builds QQ Music official web search urls', () => {
    const uri = buildOfficialServiceSearchUri('qqMusic', '周杰伦');

    expect(uri?.toString()).toBe('https://y.qq.com/n/ryqq/search?w=%E5%91%A8%E6%9D%B0%E4%BC%A6');
  });

  it('builds Open Library official API search urls', () => {
    const uri = buildOfficialServiceSearchUri('openLibrary', 'sherlock');

    expect(uri?.toString()).toBe(
      'https://openlibrary.org/search.json?q=sherlock&limit=10&fields=key%2Ctitle%2Cauthor_name%2Cfirst_publish_year'
    );
  });

  it('does not pretend Fanqie has a public search API', () => {
    expect(buildOfficialServiceSearchUri('fanqieNovel', '修仙')).toBeUndefined();
  });

  it('normalizes Open Library search responses', () => {
    const results = normalizeOpenLibraryWorks({
      docs: [
        {
          key: '/works/OL1W',
          title: 'Example',
          author_name: ['A', 'B'],
          first_publish_year: 1900
        }
      ]
    });

    expect(results).toEqual([
      {
        label: 'Example',
        description: 'A, B · 1900',
        url: 'https://openlibrary.org/works/OL1W'
      }
    ]);
  });

  it('normalizes MusicBrainz recording responses', () => {
    const results = normalizeMusicBrainzRecordings({
      recordings: [
        {
          id: 'abc',
          title: 'Track',
          'artist-credit': [{ name: 'Artist' }]
        }
      ]
    });

    expect(results).toEqual([
      {
        label: 'Track',
        description: 'Artist',
        url: 'https://musicbrainz.org/recording/abc'
      }
    ]);
  });
});
