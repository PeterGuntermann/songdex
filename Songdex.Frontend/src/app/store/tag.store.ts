import { computed, InjectionToken, inject } from '@angular/core';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import type { TagSummary } from '../models/tag';

export type TagState = {
  allTags: TagSummary[];
  loading: boolean;
  error: string | null;
};

export const initialTagState: TagState = {
  allTags: [],
  loading: false,
  error: null,
};

/** Test seam, like `SONG_STATE`. */
export const TAG_STATE = new InjectionToken<TagState>('TAG_STATE', {
  factory: () => initialTagState,
});

function byName(a: TagSummary, b: TagSummary): number {
  return a.name.localeCompare(b.name);
}

/**
 * Every tag the backend knows with its song count, including unused tags. Feeds the tag view and
 * the autocompletion in the song form; the tags of a song travel with the song itself.
 */
export const TagStore = signalStore(
  { providedIn: 'root' },
  withState(() => inject(TAG_STATE)),
  withComputed((store) => ({
    /** The tags sorted by name. */
    sortedTags: computed(() => [...store.allTags()].sort(byName)),
    /** Tag names, sorted. */
    tagNames: computed(() =>
      store
        .allTags()
        .map((tag) => tag.name)
        .sort((a, b) => a.localeCompare(b)),
    ),
    unusedCount: computed(() => store.allTags().filter((tag) => tag.songCount === 0).length),
  })),
  withMethods((store) => ({
    /** Replaces the tag catalogue with what the backend returned. */
    setTags(tags: TagSummary[]): void {
      patchState(store, { allTags: tags, loading: false, error: null });
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

    /** Adds the tag, or replaces the stored one with the same id. */
    upsertTag(tag: TagSummary): void {
      patchState(store, {
        allTags: [...store.allTags().filter((t) => t.id !== tag.id), tag],
      });
    },

    removeTag(id: string): void {
      patchState(store, { allTags: store.allTags().filter((tag) => tag.id !== id) });
    },
  })),
);

export type TagStore = InstanceType<typeof TagStore>;
