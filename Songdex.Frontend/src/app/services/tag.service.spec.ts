import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '../../environments/environment';
import type { TagSummary } from '../models/tag';
import { SONG_STATE, type SongState, SongStore } from '../store/song.store';
import { TestSongs } from '../store/song.store.testdata';
import { TAG_STATE, type TagState, TagStore } from '../store/tag.store';
import { TagService } from './tag.service';

describe('TagService', () => {
  const tagsUrl = `${environment.apiBaseUrl}/api/tags`;
  // TestSongs[3] carries t1 "Acoustic" and t2 "Rehearsed".
  const acoustic: TagSummary = { id: 't1', name: 'Acoustic', songCount: 1 };
  const rehearsed: TagSummary = { id: 't2', name: 'Rehearsed', songCount: 1 };

  let service: TagService;
  let store: TagStore;
  let songStore: SongStore;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        {
          provide: TAG_STATE,
          useValue: {
            allTags: [acoustic, rehearsed],
            loading: false,
            error: null,
          } satisfies TagState,
        },
        {
          provide: SONG_STATE,
          useValue: {
            allSongs: [TestSongs[1], TestSongs[3]],
            loading: false,
            error: null,
          } satisfies SongState,
        },
      ],
    });
    service = TestBed.inject(TagService);
    store = TestBed.inject(TagStore);
    songStore = TestBed.inject(SongStore);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  const tagNamesOfSong3 = () => songStore.getSongById('3')?.tags.map((tag) => tag.name);

  describe('fetchTags', () => {
    it('should put the response into the store', () => {
      const tags: TagSummary[] = [acoustic, { id: 't9', name: 'Unused', songCount: 0 }];

      service.fetchTags();
      expect(store.loading()).toBe(true);
      httpMock.expectOne({ method: 'GET', url: tagsUrl }).flush(tags);

      expect(store.allTags()).toEqual(tags);
      expect(store.loading()).toBe(false);
    });

    it('should keep the previous tags and report the failure', () => {
      service.fetchTags();
      httpMock
        .expectOne({ method: 'GET', url: tagsUrl })
        .flush(null, { status: 500, statusText: 'Server Error' });

      expect(store.allTags()).toEqual([acoustic, rehearsed]);
      expect(store.error()).toBe('The backend responded with 500 Server Error.');
    });
  });

  describe('renameTag', () => {
    it('should send nothing until the caller subscribes', () => {
      service.renameTag('t1', 'Unplugged');

      httpMock.expectNone(`${tagsUrl}/t1`);
    });

    it('should put the name, update the tag and the songs carrying it', () => {
      const renamed: TagSummary = { ...acoustic, name: 'Unplugged' };
      const emitted: TagSummary[] = [];

      service.renameTag('t1', 'Unplugged').subscribe((tag) => emitted.push(tag));
      const request = httpMock.expectOne({ method: 'PUT', url: `${tagsUrl}/t1` });
      expect(request.request.body).toEqual({ name: 'Unplugged' });
      request.flush(renamed);

      expect(emitted).toEqual([renamed]);
      expect(store.sortedTags()).toEqual([rehearsed, renamed]);
      expect(tagNamesOfSong3()).toEqual(['Rehearsed', 'Unplugged']);
      expect(songStore.getSongById('1')).toEqual(TestSongs[1]);
    });

    it('should explain a name that is taken and fail the stream', () => {
      let failed = false;

      service.renameTag('t1', 'Rehearsed').subscribe({ error: () => (failed = true) });
      httpMock
        .expectOne({ method: 'PUT', url: `${tagsUrl}/t1` })
        .flush(null, { status: 409, statusText: 'Conflict' });

      expect(failed).toBe(true);
      expect(store.error()).toBe('A tag named “Rehearsed” exists already. Merge the two instead.');
      expect(tagNamesOfSong3()).toEqual(['Acoustic', 'Rehearsed']);
    });
  });

  describe('deleteTag', () => {
    it('should delete the tag and remove it from the songs', () => {
      let done = false;

      service.deleteTag('t1').subscribe(() => (done = true));
      httpMock.expectOne({ method: 'DELETE', url: `${tagsUrl}/t1` }).flush(null);

      expect(done).toBe(true);
      expect(store.allTags()).toEqual([rehearsed]);
      expect(tagNamesOfSong3()).toEqual(['Rehearsed']);
    });

    it('should report a tag that is already gone', () => {
      service.deleteTag('t1').subscribe({ error: () => undefined });
      httpMock
        .expectOne({ method: 'DELETE', url: `${tagsUrl}/t1` })
        .flush(null, { status: 404, statusText: 'Not Found' });

      expect(store.error()).toBe('This tag no longer exists.');
      expect(store.allTags()).toEqual([acoustic, rehearsed]);
    });
  });

  describe('mergeTags', () => {
    it('should fold the source into the target in both stores, without duplicates', () => {
      const target: TagSummary = { ...rehearsed, songCount: 1 };

      service.mergeTags('t1', 't2').subscribe();
      httpMock.expectOne({ method: 'POST', url: `${tagsUrl}/t1/merge-into/t2` }).flush(target);

      expect(store.allTags()).toEqual([target]);
      expect(songStore.getSongById('3')?.tags).toEqual([{ id: 't2', name: 'Rehearsed' }]);
    });

    it('should report the validation problem of a refused merge', () => {
      service.mergeTags('t1', 't1').subscribe({ error: () => undefined });
      httpMock
        .expectOne(`${tagsUrl}/t1/merge-into/t1`)
        .flush(
          { errors: { targetId: ['A tag cannot be merged into itself.'] } },
          { status: 400, statusText: 'Bad Request' },
        );

      expect(store.error()).toBe(
        'The backend rejected the change: A tag cannot be merged into itself.',
      );
    });
  });
});
