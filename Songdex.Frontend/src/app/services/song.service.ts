import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { SongStore } from "../store/song.store";

@Injectable({
  providedIn: 'root',
})
export class SongService {
  readonly http = inject(HttpClient);
  readonly songStore = inject(SongStore);

  fetchSongs(): void {
    const baseUrl = 'http://localhost:5286';
    this.http.get(`${baseUrl}/api/coversongs`).subscribe({
      next: (songs) => {
        // TODO: 19.10.2025 Save to store
        console.log(songs);
      },
      error: console.log,
    });
  }
}
