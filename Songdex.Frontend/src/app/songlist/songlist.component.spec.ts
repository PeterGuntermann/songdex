import { type ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { MockProvider } from 'ng-mocks';
import { SongService } from '../services/song.service';
import { SONG_STATE, type SongState } from '../store/song.store';
import { TestSongs } from '../store/song.store.testdata';
import { SonglistComponent } from './songlist.component';

describe('SonglistComponent', () => {
  let component: SonglistComponent;
  let fixture: ComponentFixture<SonglistComponent>;

  const setup = async (allSongs: SongState['allSongs'] = []) => {
    await TestBed.configureTestingModule({
      imports: [SonglistComponent],
      providers: [
        provideRouter([]),
        MockProvider(SongService),
        {
          provide: SONG_STATE,
          useValue: { allSongs, loading: false, error: null } satisfies SongState,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SonglistComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  };

  const newSongButton = (): HTMLButtonElement | undefined =>
    Array.from(
      (fixture.nativeElement as HTMLElement).querySelectorAll<HTMLButtonElement>('button'),
    ).find((b) => b.textContent?.trim() === 'New song');

  it('should create', async () => {
    await setup();
    expect(component).toBeTruthy();
  });

  it('should offer to create a song on an empty catalogue', async () => {
    await setup([]);

    const navigateByUrl = vi.spyOn(TestBed.inject(Router), 'navigateByUrl').mockResolvedValue(true);
    newSongButton()?.click();

    expect(navigateByUrl).toHaveBeenCalledWith('/songs/new');
  });

  it('should offer to create a song above the table', async () => {
    await setup([TestSongs[0]]);

    const navigateByUrl = vi.spyOn(TestBed.inject(Router), 'navigateByUrl').mockResolvedValue(true);
    newSongButton()?.click();

    expect(navigateByUrl).toHaveBeenCalledWith('/songs/new');
  });
});
