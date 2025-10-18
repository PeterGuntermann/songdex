import { provideHttpClient } from "@angular/common/http";
import { provideHttpClientTesting } from "@angular/common/http/testing";
import { TestBed } from '@angular/core/testing';

import { SongService } from './song.service';

describe('SonglistService', () => {
  let service: SongService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(SongService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
