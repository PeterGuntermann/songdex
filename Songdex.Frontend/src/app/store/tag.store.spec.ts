import { TestBed } from '@angular/core/testing';
import type { TagSummary } from '../models/tag';
import { TAG_STATE, type TagState, TagStore } from './tag.store';

describe('TagStore', () => {
  const rehearsed: TagSummary = { id: 't2', name: 'Rehearsed', songCount: 2 };
  const acoustic: TagSummary = { id: 't1', name: 'Acoustic', songCount: 0 };

  let store: TagStore;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: TAG_STATE,
          useValue: {
            allTags: [rehearsed, acoustic],
            loading: false,
            error: null,
          } satisfies TagState,
        },
      ],
    });
    store = TestBed.inject(TagStore);
  });

  it('should list the tags and their names sorted', () => {
    expect(store.sortedTags()).toEqual([acoustic, rehearsed]);
    expect(store.tagNames()).toEqual(['Acoustic', 'Rehearsed']);
  });

  it('should count the unused tags', () => {
    expect(store.unusedCount()).toBe(1);
  });

  it('should replace the tags and clear loading and error', () => {
    store.startLoading();
    store.setTags([{ id: 't3', name: 'Summer party', songCount: 1 }]);

    expect(store.allTags()).toEqual([{ id: 't3', name: 'Summer party', songCount: 1 }]);
    expect(store.loading()).toBe(false);
    expect(store.error()).toBeNull();
  });

  it('should replace a tag with the same id and add an unknown one', () => {
    store.upsertTag({ id: 't1', name: 'Unplugged', songCount: 0 });
    store.upsertTag({ id: 't9', name: 'New', songCount: 3 });

    expect(store.sortedTags().map((tag) => tag.name)).toEqual(['New', 'Rehearsed', 'Unplugged']);
  });

  it('should remove a tag', () => {
    store.removeTag('t2');

    expect(store.allTags()).toEqual([acoustic]);
  });

  it('should keep an error until the next request starts', () => {
    store.setError('Broken');
    expect(store.error()).toBe('Broken');

    store.startLoading();
    expect(store.error()).toBeNull();
  });
});
