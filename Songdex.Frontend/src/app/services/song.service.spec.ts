import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { environment } from '../../environments/environment';
import { SONG_STATE, type SongState, SongStore } from '../store/song.store';
import { TestSongs } from '../store/song.store.testdata';
import { SongService } from './song.service';

describe('SongService', () => {
  const songsUrl = `${environment.apiBaseUrl}/api/songs`;

  let service: SongService;
  let store: SongStore;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        {
          provide: SONG_STATE,
          useValue: { allSongs: [], loading: false, error: null } satisfies SongState,
        },
      ],
    });
    service = TestBed.inject(SongService);
    store = TestBed.inject(SongStore);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe('fetchSongs', () => {
    it('should put the response into the store', () => {
      service.fetchSongs();

      expect(store.loading()).toBe(true);
      httpMock.expectOne({ method: 'GET', url: songsUrl }).flush([TestSongs[0], TestSongs[1]]);

      expect(store.allSongs()).toEqual([TestSongs[0], TestSongs[1]]);
      expect(store.loading()).toBe(false);
      expect(store.error()).toBeNull();
    });

    it('should report an unreachable backend', () => {
      service.fetchSongs();

      httpMock
        .expectOne({ method: 'GET', url: songsUrl })
        .error(new ProgressEvent('error'), { status: 0, statusText: 'Unknown Error' });

      expect(store.error()).toBe('The backend cannot be reached. Is it running?');
      expect(store.loading()).toBe(false);
      expect(store.allSongs()).toEqual([]);
    });

    it('should report a server error with its status', () => {
      service.fetchSongs();

      httpMock
        .expectOne({ method: 'GET', url: songsUrl })
        .flush('boom', { status: 500, statusText: 'Internal Server Error' });

      expect(store.error()).toBe('The backend responded with 500 Internal Server Error.');
    });
  });

  describe('fetchSong', () => {
    it('should add the single song to the store', () => {
      service.fetchSong('1');

      httpMock.expectOne({ method: 'GET', url: `${songsUrl}/1` }).flush(TestSongs[1]);

      expect(store.allSongs()).toEqual([TestSongs[1]]);
      expect(store.loading()).toBe(false);
    });

    it('should report an unknown id', () => {
      service.fetchSong('nope');

      httpMock
        .expectOne({ method: 'GET', url: `${songsUrl}/nope` })
        .flush(null, { status: 404, statusText: 'Not Found' });

      expect(store.error()).toBe('This song no longer exists.');
    });
  });

  describe('createSong', () => {
    it('should post the draft without an id and store what comes back', () => {
      const { id, ...draft } = TestSongs[2];
      service.createSong(draft);

      const request = httpMock.expectOne({ method: 'POST', url: songsUrl });
      expect(request.request.body).toEqual(draft);
      request.flush(TestSongs[2]);

      expect(store.allSongs()).toEqual([TestSongs[2]]);
    });
  });

  describe('updateSong', () => {
    it('should put the draft to the id route and replace the stored song', () => {
      store.setSongs([TestSongs[1]]);
      const changed = { ...TestSongs[1], title: 'Renamed' };

      service.updateSong(changed);

      const request = httpMock.expectOne({ method: 'PUT', url: `${songsUrl}/1` });
      expect(request.request.body).not.toHaveProperty('id');
      request.flush(changed);

      expect(store.allSongs()).toEqual([changed]);
    });
  });

  describe('deleteSong', () => {
    it('should remove the song from the store on success', () => {
      store.setSongs([TestSongs[0], TestSongs[1]]);

      service.deleteSong('1');
      httpMock
        .expectOne({ method: 'DELETE', url: `${songsUrl}/1` })
        .flush(null, { status: 204, statusText: 'No Content' });

      expect(store.allSongs()).toEqual([TestSongs[0]]);
    });

    it('should keep the song and report the error on failure', () => {
      store.setSongs([TestSongs[0], TestSongs[1]]);

      service.deleteSong('1');
      httpMock
        .expectOne({ method: 'DELETE', url: `${songsUrl}/1` })
        .flush(null, { status: 404, statusText: 'Not Found' });

      expect(store.allSongs()).toEqual([TestSongs[0], TestSongs[1]]);
      expect(store.error()).toBe('This song no longer exists.');
    });
  });
});
