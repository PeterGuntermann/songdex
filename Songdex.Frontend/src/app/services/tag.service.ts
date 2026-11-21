import { HttpClient, type HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { catchError, defer, type Observable, tap, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import type { TagSummary } from '../models/tag';
import { SongStore } from '../store/song.store';
import { TagStore } from '../store/tag.store';

/**
 * Talks to `/api/tags`. The writing methods are cold like those of `SongService`; on success they
 * patch the `TagStore` and also the tags of the songs in the `SongStore`, so that the detail page
 * and the form never show a tag that was renamed, deleted or merged away.
 */
@Injectable({
  providedIn: 'root',
})
export class TagService {
  private readonly http = inject(HttpClient);
  private readonly tagStore = inject(TagStore);
  private readonly songStore = inject(SongStore);

  private readonly tagsUrl = `${environment.apiBaseUrl}/api/tags`;

  /**
   * Refreshes the tag catalogue. A failure only sets the store's `error`: the song form ignores
   * it, because it stays usable without suggestions.
   */
  fetchTags(): void {
    this.tagStore.startLoading();
    this.http.get<TagSummary[]>(this.tagsUrl).subscribe({
      next: (tags) => this.tagStore.setTags(tags),
      error: (error: HttpErrorResponse) => this.tagStore.setError(this.describe(error)),
    });
  }

  renameTag(id: string, name: string): Observable<TagSummary> {
    return this.write(
      this.http.put<TagSummary>(`${this.tagsUrl}/${id}`, { name }),
      (renamed) => {
        this.tagStore.upsertTag(renamed);
        this.songStore.renameTag(renamed);
      },
      name,
    );
  }

  deleteTag(id: string): Observable<void> {
    return this.write(this.http.delete<void>(`${this.tagsUrl}/${id}`), () => {
      this.tagStore.removeTag(id);
      this.songStore.removeTag(id);
    });
  }

  /** Folds `sourceId` into `targetId`; emits the target with its new song count. */
  mergeTags(sourceId: string, targetId: string): Observable<TagSummary> {
    const url = `${this.tagsUrl}/${sourceId}/merge-into/${targetId}`;
    return this.write(this.http.post<TagSummary>(url, null), (target) => {
      this.tagStore.removeTag(sourceId);
      this.tagStore.upsertTag(target);
      this.songStore.mergeTag(sourceId, target);
    });
  }

  /** Wraps a request: cold, loading/error bookkeeping, store patch before the value is emitted. */
  private write<T>(
    request: Observable<T>,
    apply: (value: T) => void,
    name?: string,
  ): Observable<T> {
    return defer(() => {
      this.tagStore.startLoading();
      return request;
    }).pipe(
      tap((value) => {
        apply(value);
        this.tagStore.finishLoading();
      }),
      catchError((error: HttpErrorResponse) => {
        this.tagStore.setError(this.describe(error, name));
        return throwError(() => error);
      }),
    );
  }

  private describe(error: HttpErrorResponse, name?: string): string {
    if (error.status === 0) {
      return 'The backend cannot be reached. Is it running?';
    }
    if (error.status === 404) {
      return 'This tag no longer exists.';
    }
    if (error.status === 409) {
      return `A tag named “${name ?? ''}” exists already. Merge the two instead.`;
    }
    if (error.status === 400) {
      const errors = (error.error as { errors?: Record<string, string[]> } | null)?.errors;
      const problems = errors ? Object.values(errors).flat() : [];
      if (problems.length > 0) {
        return `The backend rejected the change: ${problems.join(' ')}`;
      }
    }
    return `The backend responded with ${error.status} ${error.statusText}.`;
  }
}
