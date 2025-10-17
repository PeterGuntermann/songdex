import { signalStore, withState } from "@ngrx/signals";
import { newSong, type Song } from "../models/song";
import { generateDummySongs } from "../util/dummy-data";

export const SongStore = signalStore(
  { providedIn: 'root' },
  withState({
    allSongs: [newSong('From signal store'), ...generateDummySongs()] as Song[],
  }),
  // withComputed({
  //   songById: (id: string) => this.songs().find((song) => song.id === id);
  // }),
);

export type SongStore = InstanceType<typeof SongStore>;
