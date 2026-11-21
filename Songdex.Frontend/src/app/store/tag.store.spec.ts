import { TestBed } from '@angular/core/testing';
import { TAG_STATE, type TagState, TagStore } from './tag.store';

describe('TagStore', () => {
  let store: TagStore;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: TAG_STATE,
          useValue: {
            allTags: [
              { id: 't2', name: 'Rehearsed' },
              { id: 't1', name: 'Acoustic' },
            ],
          } satisfies TagState,
        },
      ],
    });
    store = TestBed.inject(TagStore);
  });

  it('should list the tag names sorted', () => {
    expect(store.tagNames()).toEqual(['Acoustic', 'Rehearsed']);
  });

  it('should replace the tags', () => {
    store.setTags([{ id: 't3', name: 'Summer party' }]);

    expect(store.allTags()).toEqual([{ id: 't3', name: 'Summer party' }]);
    expect(store.tagNames()).toEqual(['Summer party']);
  });
});
