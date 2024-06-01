import { newSong, type Song } from '../models/song';

export const generateDummySongs = () => dummySongs;

export const dummySongs: Song[] = [
  newSong('Runaway', 'Bon Jovi', 'http://example.com'),
  newSong('Hurra', 'Die Ärzte', 'http://example.com'),
  newSong('Listen', 'Beyoncé', 'http://example.com'),
  newSong('Shallow', 'Lady Gaga & Bradley Cooper', 'http://example.com'),
  newSong('Shut up and dance', 'Walk The Moon', 'http://example.com'),
];
