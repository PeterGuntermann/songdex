import { type ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { MockProvider } from 'ng-mocks';
import type { Mock } from 'vitest';
import { SongService } from '../services/song.service';
import { SONG_STATE, type SongState, SongStore } from '../store/song.store';
import { TestSongs } from '../store/song.store.testdata';

import { SongdetailsComponent } from './songdetails.component';

describe('SongdetailsComponent', () => {
  let fixture: ComponentFixture<SongdetailsComponent>;
  let component: SongdetailsComponent;
  let fetchSong: Mock<(id: string) => void>;

  const setup = async (songId: string, state: SongState) => {
    fetchSong = vi.fn<(id: string) => void>();
    await TestBed.configureTestingModule({
      imports: [SongdetailsComponent],
      providers: [
        MockProvider(SongService, { fetchSong }),
        MockProvider(ActivatedRoute, {
          snapshot: { paramMap: convertToParamMap({ songId }) },
        } as Partial<ActivatedRoute>),
        { provide: SONG_STATE, useValue: state },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SongdetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  };

  const idle = (allSongs: SongState['allSongs']): SongState => ({
    allSongs,
    loading: false,
    error: null,
  });

  it('should create', async () => {
    await setup('1', idle([TestSongs[1]]));
    expect(component).toBeTruthy();
  });

  it('should show the song that is already in the store without fetching', async () => {
    await setup('1', idle([TestSongs[0], TestSongs[1]]));

    expect(component.song()).toEqual(TestSongs[1]);
    expect(fetchSong).not.toHaveBeenCalled();
  });

  it('should fetch the song when the store does not have it yet', async () => {
    await setup('1', idle([]));

    expect(fetchSong).toHaveBeenCalledWith('1');
  });

  it('should pick up the song once the fetch has filled the store', async () => {
    await setup('1', idle([]));
    expect(component.song()).toBeUndefined();

    TestBed.inject(SongStore).addSong(TestSongs[1]);

    expect(component.song()).toEqual(TestSongs[1]);
  });
});
