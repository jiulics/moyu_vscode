export type OfficialServiceId = 'qqMusic' | 'musicBrainz' | 'openLibrary' | 'fanqieNovel';

export interface ExternalSearchResult {
  label: string;
  description: string;
  url: string;
}

interface OpenLibraryWork {
  key?: string;
  title?: string;
  author_name?: string[];
  first_publish_year?: number;
}

interface OpenLibraryResponse {
  docs?: OpenLibraryWork[];
}

interface MusicBrainzRecording {
  id?: string;
  title?: string;
  'artist-credit'?: Array<{ name?: string }>;
}

interface MusicBrainzResponse {
  recordings?: MusicBrainzRecording[];
}

export function buildOfficialServiceSearchUri(
  serviceId: OfficialServiceId,
  query: string
): URL | undefined {
  const trimmed = query.trim();
  if (!trimmed) {
    return undefined;
  }

  if (serviceId === 'qqMusic') {
    return new URL(`https://y.qq.com/n/ryqq/search?w=${encodeURIComponent(trimmed)}`);
  }

  if (serviceId === 'musicBrainz') {
    return new URL(
      `https://musicbrainz.org/ws/2/recording?query=${encodeURIComponent(
        trimmed
      )}&fmt=json&limit=10`
    );
  }

  if (serviceId === 'openLibrary') {
    return new URL(
      `https://openlibrary.org/search.json?q=${encodeURIComponent(
        trimmed
      )}&limit=10&fields=key%2Ctitle%2Cauthor_name%2Cfirst_publish_year`
    );
  }

  return undefined;
}

export function normalizeOpenLibraryWorks(response: unknown): ExternalSearchResult[] {
  const data = response as OpenLibraryResponse;
  return (data.docs ?? [])
    .filter((work) => Boolean(work.key && work.title))
    .map((work) => ({
      label: work.title ?? 'Untitled',
      description: [work.author_name?.join(', '), work.first_publish_year].filter(Boolean).join(' · '),
      url: `https://openlibrary.org${work.key}`
    }));
}

export function normalizeMusicBrainzRecordings(response: unknown): ExternalSearchResult[] {
  const data = response as MusicBrainzResponse;
  return (data.recordings ?? [])
    .filter((recording) => Boolean(recording.id && recording.title))
    .map((recording) => ({
      label: recording.title ?? 'Untitled',
      description:
        recording['artist-credit']
          ?.map((artist) => artist.name)
          .filter(Boolean)
          .join(', ') ?? '',
      url: `https://musicbrainz.org/recording/${recording.id}`
    }));
}
