import { InjectionToken, inject } from '@angular/core';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import type { Song } from '../models/song';

export type SongState = {
  allSongs: Song[];
  loading: boolean;
  error: string | null;
};

export const initialState: SongState = {
  allSongs: [],
  loading: false,
  error: null,
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

    /** Replaces the catalogue with what the backend returned. */
    setSongs(songs: Song[]): void {
      patchState(store, { allSongs: songs, loading: false, error: null });
    },

    /** Marks a request as in flight and clears the error of the previous attempt. */
    startLoading(): void {
      patchState(store, { loading: true, error: null });
    },

    /** Ends a request that changed the catalogue through one of the methods below. */
    finishLoading(): void {
      patchState(store, { loading: false, error: null });
    },

    setError(error: string): void {
      patchState(store, { error, loading: false });
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
