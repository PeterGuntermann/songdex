import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import type { Observable } from 'rxjs';
import type { Song } from '../models/song';
import { SongStore } from "../store/song.store";

@Injectable({
  providedIn: 'root',
})
export class SongService {
  readonly http = inject(HttpClient);
  readonly songStore = inject(SongStore);

  getSongById(id: string): Song | undefined {
    return this.songStore.allSongs().find((song) => song.id === id);
  }

  getSongs(): Observable<unknown> {
    const baseUrl = 'http://localhost:5286';
    return this.http.get(`${baseUrl}/api/coversongs`);
  }
}
