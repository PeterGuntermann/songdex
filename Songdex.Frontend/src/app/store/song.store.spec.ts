import { TestBed } from '@angular/core/testing';
import { SONG_STATE, type SongState, SongStore } from './song.store';
import { TestSongs } from "./song.store.testdata";

describe('SongStore', () => {
  let store: SongStore;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: SONG_STATE,
          useValue: {
            allSongs: [TestSongs[0], TestSongs[1]],
          } as SongState,
        },
      ],
    });
    store = TestBed.inject(SongStore);
  });

  it('should get all songs', () => {
    const result = store.allSongs();
    expect(result).toEqual([TestSongs[0], TestSongs[1]]);
  });

  it('should get song count', () => {
    expect(store.songCount()).toBe(2);
  });

  describe('getSongById', () => {
    it('should return song if it exists', () => {
      expect(store.getSongById('1')).toEqual(TestSongs[1]);
    });

    it('should return undefined if it does not exist', () => {
      expect(store.getSongById('2')).toBeUndefined();
    });
  });
});
