import { Injectable, signal } from '@angular/core';
import type { Song } from '../models/song';
import { generateDummySongs } from '../util/dummy-data';

@Injectable({
  providedIn: 'root',
})
export class SonglistService {
  readonly songs = signal<Song[]>(generateDummySongs());
}
