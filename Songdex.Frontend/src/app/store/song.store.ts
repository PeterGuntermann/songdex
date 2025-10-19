import { inject, InjectionToken } from '@angular/core';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
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
  withComputed((store) => ({
    songCount: () => store.allSongs().length,
  })),
  withMethods((store) => ({
    getSongById(id: string): Song | undefined {
      return store.allSongs().find((song) => song.id === id);
    },

    addSong(song: Song): void {
      patchState(store, {
        allSongs: store.allSongs().some((s) => s.id === song.id)
          ? store.allSongs()
          : [...store.allSongs(), song],
      });
    },

    deleteSong(id: string): void {
      patchState(store, {
        allSongs: store.allSongs().filter((song) => song.id !== id),
      });
    },

    updateSong(updatedSong: Song): void {
      patchState(store, {
        allSongs: store.allSongs().map((song) => (song.id === updatedSong.id ? updatedSong : song)),
      });
    },

    deleteSongs(ids: string[]): void {
      patchState(store, {
        allSongs: store.allSongs().filter((song) => !ids.includes(song.id)),
      });
    },
  })),
);

export type SongStore = InstanceType<typeof SongStore>;
