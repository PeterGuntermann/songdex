import { generateEightRandomHexDigits } from '../util/random-generator';

export type Song = {
  id: string;
  title: string;
  artist: string;
  link: string;
};

export const newSong = (title: string, artist = '', link = ''): Song => {
  return {
    id: generateEightRandomHexDigits(),
    title,
    artist,
    link,
  };
};
