import { type ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ActivatedRoute, convertToParamMap, Router } from '@angular/router';
import { MockProvider } from 'ng-mocks';
import type { Mock } from 'vitest';
import { SongService } from '../services/song.service';
import { SongdeleteComponent } from '../songdelete/songdelete.component';
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

  it('should show the tags as chips', async () => {
    await setup('3', idle([TestSongs[3]]));

    const badges = Array.from(
      (fixture.nativeElement as HTMLElement).querySelectorAll('[aria-label="Tags"] .badge'),
    ).map((b) => b.textContent?.trim());
    expect(badges).toEqual(['Acoustic', 'Rehearsed']);
  });

  it('should leave out the tag row for a song without tags', async () => {
    await setup('1', idle([TestSongs[1]]));

    expect((fixture.nativeElement as HTMLElement).querySelector('[aria-label="Tags"]')).toBeNull();
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

  it('should open the edit form from the edit button', async () => {
    await setup('1', idle([TestSongs[1]]));
    const navigate = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);

    const button = Array.from(
      (fixture.nativeElement as HTMLElement).querySelectorAll<HTMLButtonElement>('button'),
    ).find((b) => b.textContent?.trim() === 'Edit');
    button?.click();

    expect(navigate).toHaveBeenCalledWith(['/songs', '1', 'edit']);
  });

  describe('delete', () => {
    const deleteControl = (): SongdeleteComponent =>
      fixture.debugElement.query(By.directive(SongdeleteComponent)).componentInstance;

    it('should offer to delete the song shown', async () => {
      await setup('1', idle([TestSongs[1]]));

      expect(deleteControl().song()).toEqual(TestSongs[1]);
    });

    it('should go back to the list once the song is deleted', async () => {
      await setup('1', idle([TestSongs[1]]));
      const navigate = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);

      deleteControl().deleted.emit();

      expect(navigate).toHaveBeenCalledWith(['/songs']);
    });

    it('should stay and show why the song could not be deleted', async () => {
      await setup('1', idle([TestSongs[1]]));
      const navigate = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);

      deleteControl().failed.emit('The backend cannot be reached. Is it running?');
      fixture.detectChanges();

      expect(navigate).not.toHaveBeenCalled();
      expect(
        (fixture.nativeElement as HTMLElement).querySelector('[role="alert"]')?.textContent,
      ).toContain('The backend cannot be reached.');
    });
  });
});
