import { inject, InjectionToken } from '@angular/core';
import { signalStore, withMethods, withState } from '@ngrx/signals';
import { newSong, type Song } from '../models/song';
import { generateDummySongs } from '../util/dummy-data';

export type SongState = {
  allSongs: Song[];
};

export const initialState: SongState = {
  allSongs: [newSong('From signal store'), ...generateDummySongs()],
};

export const SONG_STATE = new InjectionToken<SongState>('SONG_STATE', {
  factory: () => initialState,
});

export const SongStore = signalStore(
  { providedIn: 'root' },
  withState(() => inject(SONG_STATE)),
  withMethods((store) => ({
    getSongById(id: string): Song | undefined {
      return store.allSongs().find((song) => song.id === id);
    },
  })),
);

export type SongStore = InstanceType<typeof SongStore>;
