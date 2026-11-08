import type { Song } from '../models/song';

const noExtras = { notes: null, genre: null, language: null, album: null } as const;

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
  },
];
