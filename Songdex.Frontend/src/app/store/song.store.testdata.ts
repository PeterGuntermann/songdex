import type { Song, SongDraft } from '../models/song';

const noExtras = { notes: null, genre: null, language: null, album: null, tags: [] };

export const TestSongs: Song[] = [
  {
    id: '0',
    title: 'Song 0',
    artist: 'Artist 0',
    releaseYear: null,
    referenceLink: null,
    ...noExtras,
  },
  {
    id: '1',
    title: 'Song 1',
    artist: 'Artist 1',
    releaseYear: 1999,
    referenceLink: null,
    ...noExtras,
  },
  {
    id: '2',
    title: 'Song 2',
    artist: 'Artist 2',
    releaseYear: null,
    referenceLink: null,
    ...noExtras,
  },
  {
    id: '3',
    title: 'Song 3',
    artist: 'Artist 3',
    releaseYear: null,
    referenceLink: 'http://example.com',
    notes: 'First line\nSecond line',
    genre: 'Pop',
    language: 'English',
    album: 'Album 3',
    tags: [
      { id: 't1', name: 'Acoustic' },
      { id: 't2', name: 'Rehearsed' },
    ],
  },
];

/** The draft a form would send for `song`: no id, tags as names. */
export function draftOf(song: Song): SongDraft {
  const { id: _id, tags, ...fields } = song;
  return { ...fields, tags: tags.map((tag) => tag.name) };
}

/** What the backend would answer for `draft`: tag names turned into tags with made-up ids. */
export function songFrom(id: string, draft: SongDraft): Song {
  return { id, ...draft, tags: draft.tags.map((name) => ({ id: `tag-${name}`, name })) };
}
