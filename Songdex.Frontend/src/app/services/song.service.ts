import { HttpClient, type HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '../../environments/environment';
import type { Song, SongDraft } from '../models/song';
import { SongStore } from '../store/song.store';

@Injectable({
  providedIn: 'root',
})
export class SongService {
  private readonly http = inject(HttpClient);
  private readonly songStore = inject(SongStore);

  private readonly songsUrl = `${environment.apiBaseUrl}/api/songs`;

  fetchSongs(): void {
    this.songStore.startLoading();
    this.http.get<Song[]>(this.songsUrl).subscribe({
      next: (songs) => this.songStore.setSongs(songs),
      error: (error: HttpErrorResponse) => this.songStore.setError(this.describe(error)),
    });
  }

  /** Loads a single song, for when the catalogue has not been fetched yet (deep link). */
  fetchSong(id: string): void {
    this.songStore.startLoading();
    this.http.get<Song>(`${this.songsUrl}/${id}`).subscribe({
      next: (song) => {
        this.songStore.addSong(song);
        this.songStore.finishLoading();
      },
      error: (error: HttpErrorResponse) => this.songStore.setError(this.describe(error)),
    });
  }

  createSong(draft: SongDraft): void {
    this.songStore.startLoading();
    this.http.post<Song>(this.songsUrl, draft).subscribe({
      next: (song) => {
        this.songStore.addSong(song);
        this.songStore.finishLoading();
      },
      error: (error: HttpErrorResponse) => this.songStore.setError(this.describe(error)),
    });
  }

  updateSong(song: Song): void {
    this.songStore.startLoading();
    const { id, ...draft } = song;
    this.http.put<Song>(`${this.songsUrl}/${id}`, draft).subscribe({
      next: (updated) => {
        this.songStore.updateSong(updated);
        this.songStore.finishLoading();
      },
      error: (error: HttpErrorResponse) => this.songStore.setError(this.describe(error)),
    });
  }

  deleteSong(id: string): void {
    this.songStore.startLoading();
    this.http.delete<void>(`${this.songsUrl}/${id}`).subscribe({
      next: () => {
        this.songStore.deleteSong(id);
        this.songStore.finishLoading();
      },
      error: (error: HttpErrorResponse) => this.songStore.setError(this.describe(error)),
    });
  }

  private describe(error: HttpErrorResponse): string {
    if (error.status === 0) {
      return 'The backend cannot be reached. Is it running?';
    }
    if (error.status === 404) {
      return 'This song no longer exists.';
    }
    return `The backend responded with ${error.status} ${error.statusText}.`;
  }
}
