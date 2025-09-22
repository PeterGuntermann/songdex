import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import type { Observable } from 'rxjs';
import type { Song } from '../models/song';
import { generateDummySongs } from '../util/dummy-data';

@Injectable({
  providedIn: 'root',
})
export class SongService {
  readonly http = inject(HttpClient);

  readonly songs = signal<Song[]>(generateDummySongs());

  getSongById(id: string): Song | undefined {
    return this.songs().find((song) => song.id === id);
  }

  getSongs(): Observable<unknown> {
    const baseUrl = 'http://localhost:5286';
    return this.http.get(`${baseUrl}/api/coversongs`);
  }
}
