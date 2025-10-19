import { TestBed } from '@angular/core/testing';
import { newSong } from '../models/song';
import { SONG_STATE, type SongState, SongStore } from './song.store';

describe('SongStore', () => {
  let store: SongStore;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: SONG_STATE,
          useValue: {
            allSongs: [newSong('Foo foo')],
          } as SongState,
        },
      ],
    });
    store = TestBed.inject(SongStore);
  });

  it('should get all songs', () => {
    const result = store.allSongs();
    expect(result[0].title).toEqual('Foo foo');
  });
});
