import { computed, InjectionToken, inject } from '@angular/core';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import type { Tag } from '../models/tag';

export type TagState = {
  allTags: Tag[];
};

export const initialTagState: TagState = {
  allTags: [],
};

/** Test seam, like `SONG_STATE`. */
export const TAG_STATE = new InjectionToken<TagState>('TAG_STATE', {
  factory: () => initialTagState,
});

/**
 * Every tag the backend knows, including those no song carries. Used for autocompletion; the
 * tags of a song travel with the song itself.
 */
export const TagStore = signalStore(
  { providedIn: 'root' },
  withState(() => inject(TAG_STATE)),
  withComputed((store) => ({
    /** Tag names, sorted. */
    tagNames: computed(() =>
      store
        .allTags()
        .map((tag) => tag.name)
        .sort((a, b) => a.localeCompare(b)),
    ),
  })),
  withMethods((store) => ({
    /** Replaces the tag catalogue with what the backend returned. */
    setTags(tags: Tag[]): void {
      patchState(store, { allTags: tags });
    },
  })),
);

export type TagStore = InstanceType<typeof TagStore>;
