import { TestBed } from '@angular/core/testing';
import { SONG_STATE, type SongState, SongStore } from './song.store';
import { TestSongs } from './song.store.testdata';

describe('SongStore', () => {
  let store: SongStore;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: SONG_STATE,
          useValue: {
            allSongs: [TestSongs[0], TestSongs[1], TestSongs[3]],
            loading: false,
            error: null,
          } satisfies SongState,
        },
      ],
    });
    store = TestBed.inject(SongStore);
  });

  describe('getter signals', () => {
    it('should get all songs', () => {
      expect(store.allSongs()).toEqual([TestSongs[0], TestSongs[1], TestSongs[3]]);
    });

    it('should get song count', () => {
      expect(store.songCount()).toBe(3);
    });
  });

  describe('getSongById', () => {
    it('should return song if it exists', () => {
      expect(store.getSongById('1')).toEqual(TestSongs[1]);
    });

    it('should return undefined if it does not exist', () => {
      expect(store.getSongById('2')).toBeUndefined();
    });
  });

  describe('addSong', () => {
    it('should add a song if it did not exist before', () => {
      store.addSong(TestSongs[2]);
      expect(store.allSongs()).toEqual([TestSongs[0], TestSongs[1], TestSongs[3], TestSongs[2]]);
    });

    it('should do nothing if the song id existed before', () => {
      const ignoredSong = { ...TestSongs[1], title: 'Another song title' };
      store.addSong(ignoredSong);
      expect(store.allSongs()).toEqual([TestSongs[0], TestSongs[1], TestSongs[3]]);
    });
  });

  describe('deleteSong', () => {
    it('should delete an existing song', () => {
      store.deleteSong('1');
      expect(store.allSongs()).toEqual([TestSongs[0], TestSongs[3]]);
    });

    it('should do nothing if the song did not exist before', () => {
      store.deleteSong('2');
      expect(store.allSongs()).toEqual([TestSongs[0], TestSongs[1], TestSongs[3]]);
    });
  });

  describe('updateSong', () => {
    it('should replace an existing song with the provided update song', () => {
      const updatedSong = { ...TestSongs[1], title: 'Another song title' };
      store.updateSong(updatedSong);
      expect(store.allSongs()).toEqual([TestSongs[0], updatedSong, TestSongs[3]]);
    });

    it('should do nothing if the song does not exist', () => {
      store.updateSong(TestSongs[2]);
      expect(store.allSongs()).toEqual([TestSongs[0], TestSongs[1], TestSongs[3]]);
    });
  });

  describe('deleteSongs', () => {
    it('should delete all songs that match one of the given ids', () => {
      store.deleteSongs(['3', '2', '1']);
      expect(store.allSongs()).toEqual([TestSongs[0]]);
    });

    it('should do nothing if no ids are given', () => {
      store.deleteSongs([]);
      expect(store.allSongs()).toEqual([TestSongs[0], TestSongs[1], TestSongs[3]]);
    });
  });

  describe('request state', () => {
    it('should start out idle', () => {
      expect(store.loading()).toBe(false);
      expect(store.error()).toBeNull();
    });

    it('should clear the previous error when a new request starts', () => {
      store.setError('earlier failure');
      store.startLoading();
      expect(store.loading()).toBe(true);
      expect(store.error()).toBeNull();
    });

    it('should replace the catalogue and end the request on setSongs', () => {
      store.startLoading();
      store.setSongs([TestSongs[2]]);
      expect(store.allSongs()).toEqual([TestSongs[2]]);
      expect(store.loading()).toBe(false);
      expect(store.error()).toBeNull();
    });

    it('should end the request without touching the catalogue on finishLoading', () => {
      store.startLoading();
      store.finishLoading();
      expect(store.loading()).toBe(false);
      expect(store.allSongs()).toEqual([TestSongs[0], TestSongs[1], TestSongs[3]]);
    });

    it('should end the request and keep the catalogue on setError', () => {
      store.startLoading();
      store.setError('backend unreachable');
      expect(store.loading()).toBe(false);
      expect(store.error()).toBe('backend unreachable');
      expect(store.allSongs()).toEqual([TestSongs[0], TestSongs[1], TestSongs[3]]);
    });
  });
});
