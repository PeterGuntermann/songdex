import { TestBed } from '@angular/core/testing';

import { SonglistService } from './songlist.service';

describe('SonglistService', () => {
  let service: SonglistService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SonglistService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
