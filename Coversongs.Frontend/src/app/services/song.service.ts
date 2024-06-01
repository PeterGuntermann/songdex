import { Injectable, signal } from '@angular/core';
import type { Song } from '../models/song';
import { generateDummySongs } from '../util/dummy-data';

@Injectable({
  providedIn: 'root',
})
export class SongService {
  readonly songs = signal<Song[]>(generateDummySongs());

  getSongById(id: string): Song | undefined {
    return this.songs().find((song) => song.id === id);
  }
}
