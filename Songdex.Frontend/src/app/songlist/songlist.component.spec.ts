import { type ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideRouter, Router } from '@angular/router';
import { MockProvider } from 'ng-mocks';
import { SongService } from '../services/song.service';
import { stubDialog } from '../shared/confirm-dialog/dialog.testing';
import { SongdeleteComponent } from '../songdelete/songdelete.component';
import { SONG_STATE, type SongState } from '../store/song.store';
import { TestSongs } from '../store/song.store.testdata';
import { SonglistComponent } from './songlist.component';

describe('SonglistComponent', () => {
  let component: SonglistComponent;
  let fixture: ComponentFixture<SonglistComponent>;

  const setup = async (allSongs: SongState['allSongs'] = [], state: Partial<SongState> = {}) => {
    await TestBed.configureTestingModule({
      imports: [SonglistComponent],
      providers: [
        provideRouter([]),
        MockProvider(SongService),
        {
          provide: SONG_STATE,
          useValue: { allSongs, loading: false, error: null, ...state } satisfies SongState,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SonglistComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  };

  const el = (): HTMLElement => fixture.nativeElement;
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

  it('should show a spinner while the first load is in flight', async () => {
    await setup([], { loading: true });

    expect(el().textContent).toContain('Loading songs');
    expect(newSongButton()).toBeUndefined();
  });

  it('should show the error without the empty-catalogue hint', async () => {
    await setup([], { error: 'The backend cannot be reached. Is it running?' });

    expect(el().querySelector('[role="alert"]')?.textContent).toContain('cannot be reached');
    expect(el().textContent).not.toContain('No songs yet.');
  });

  describe('delete', () => {
    it('should offer a delete for every row', async () => {
      await setup([TestSongs[0], TestSongs[1]]);

      const controls = fixture.debugElement
        .queryAll(By.directive(SongdeleteComponent))
        .map((d) => (d.componentInstance as SongdeleteComponent).song());
      expect(controls).toEqual([TestSongs[0], TestSongs[1]]);
    });

    it('should not open the song when its delete button is clicked', async () => {
      stubDialog();
      await setup([TestSongs[0]]);
      const navigateByUrl = vi
        .spyOn(TestBed.inject(Router), 'navigateByUrl')
        .mockResolvedValue(true);

      el().querySelector<HTMLButtonElement>('app-songdelete button')?.click();

      expect(navigateByUrl).not.toHaveBeenCalled();
    });

    it('should keep the table while a delete is in flight', async () => {
      await setup([TestSongs[0]], { loading: true });

      expect(el().querySelector('table')).not.toBeNull();
      expect(el().textContent).not.toContain('Loading songs');
    });

    it('should show a failed delete above the table instead of replacing it', async () => {
      await setup([TestSongs[0]], { error: 'This song no longer exists.' });

      expect(el().querySelector('[role="alert"]')?.textContent).toContain(
        'This song no longer exists.',
      );
      expect(el().querySelector('table')).not.toBeNull();
    });
  });
});
