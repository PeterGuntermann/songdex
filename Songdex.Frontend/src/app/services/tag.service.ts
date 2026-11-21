import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '../../environments/environment';
import type { Tag } from '../models/tag';
import { TagStore } from '../store/tag.store';

@Injectable({
  providedIn: 'root',
})
export class TagService {
  private readonly http = inject(HttpClient);
  private readonly tagStore = inject(TagStore);

  private readonly tagsUrl = `${environment.apiBaseUrl}/api/tags`;

  /**
   * Refreshes the tag catalogue. A failure is deliberately silent: the tags only feed the
   * autocompletion, and the song form stays usable without suggestions.
   */
  fetchTags(): void {
    this.http.get<Tag[]>(this.tagsUrl).subscribe({
      next: (tags) => this.tagStore.setTags(tags),
      error: () => {
        // Keep whatever suggestions were loaded before.
      },
    });
  }
}
