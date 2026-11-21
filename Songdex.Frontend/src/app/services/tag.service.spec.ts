import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '../../environments/environment';
import type { Tag } from '../models/tag';
import { TAG_STATE, type TagState, TagStore } from '../store/tag.store';
import { TagService } from './tag.service';

describe('TagService', () => {
  const tagsUrl = `${environment.apiBaseUrl}/api/tags`;
  const acoustic: Tag = { id: 't1', name: 'Acoustic' };

  let service: TagService;
  let store: TagStore;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: TAG_STATE, useValue: { allTags: [acoustic] } satisfies TagState },
      ],
    });
    service = TestBed.inject(TagService);
    store = TestBed.inject(TagStore);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should put the response into the store', () => {
    const tags: Tag[] = [acoustic, { id: 't2', name: 'Rehearsed' }];

    service.fetchTags();
    httpMock.expectOne({ method: 'GET', url: tagsUrl }).flush(tags);

    expect(store.allTags()).toEqual(tags);
  });

  it('should keep the previous tags when the backend fails', () => {
    service.fetchTags();
    httpMock
      .expectOne({ method: 'GET', url: tagsUrl })
      .flush(null, { status: 500, statusText: 'Server Error' });

    expect(store.allTags()).toEqual([acoustic]);
  });
});
