import { type ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { MockProvider } from 'ng-mocks';
import { Observable, of, throwError } from 'rxjs';
import type { Mock } from 'vitest';
import type { Song, SongDraft } from '../models/song';
import { SongService } from '../services/song.service';
import { stubDialog } from '../shared/confirm-dialog/dialog.testing';
import { SONG_STATE, type SongState, SongStore } from '../store/song.store';
import { TestSongs } from '../store/song.store.testdata';
import { SongformComponent } from './songform.component';

describe('SongformComponent', () => {
  let fixture: ComponentFixture<SongformComponent>;
  let component: SongformComponent;
  let createSong: Mock<(draft: SongDraft) => Observable<Song>>;
  let fetchSongs: Mock<() => void>;
  let navigate: Mock<Router['navigate']>;

  const setup = async (allSongs: Song[] = [TestSongs[3]]) => {
    stubDialog();
    createSong = vi.fn<(draft: SongDraft) => Observable<Song>>(() => of(TestSongs[2]));
    fetchSongs = vi.fn<() => void>();
    await TestBed.configureTestingModule({
      imports: [SongformComponent],
      providers: [
        provideRouter([]),
        MockProvider(SongService, { createSong, fetchSongs }),
        {
          provide: SONG_STATE,
          useValue: { allSongs, loading: false, error: null } satisfies SongState,
        },
      ],
    }).compileComponents();

    navigate = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    fixture = TestBed.createComponent(SongformComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  };

  const el = (): HTMLElement => fixture.nativeElement;
  const saveButton = () => el().querySelector<HTMLButtonElement>('button[type="submit"]');
  const cancelButton = () =>
    Array.from(el().querySelectorAll<HTMLButtonElement>('button')).find(
      (b) => b.textContent?.trim() === 'Cancel',
    );
  const dialog = () => el().querySelector<HTMLDialogElement>('dialog');

  describe('layout', () => {
    it('should group the fields into identity, references and catalogue', async () => {
      await setup();

      const legends = Array.from(el().querySelectorAll('legend')).map((l) => l.textContent?.trim());
      expect(legends).toEqual(['Identity', 'References', 'Catalogue']);
    });

    it('should mark only the title as required', async () => {
      await setup();

      expect(el().textContent).toContain('Title *');
      expect(el().textContent?.match(/\*/g)).toHaveLength(1);
    });

    it('should offer the existing genres and languages for autocompletion', async () => {
      await setup([TestSongs[3], { ...TestSongs[1], genre: 'Rock', language: 'German' }]);

      const options = (id: string) =>
        Array.from(el().querySelectorAll<HTMLOptionElement>(`#${id} option`)).map((o) => o.value);
      expect(options('genre-options')).toEqual(['Pop', 'Rock']);
      expect(options('language-options')).toEqual(['English', 'German']);
    });

    it('should load the catalogue on a deep link so the suggestions exist', async () => {
      await setup([]);

      expect(fetchSongs).toHaveBeenCalled();
    });

    it('should not reload a catalogue that is already there', async () => {
      await setup();

      expect(fetchSongs).not.toHaveBeenCalled();
    });
  });

  describe('validation', () => {
    it('should block saving an empty form', async () => {
      await setup();

      expect(saveButton()?.disabled).toBe(true);
    });

    it('should treat a title of only spaces as missing', async () => {
      await setup();

      component.form.controls.title.setValue('   ');
      fixture.detectChanges();

      expect(component.form.controls.title.hasError('required')).toBe(true);
      expect(saveButton()?.disabled).toBe(true);
    });

    it('should enable saving once the title is filled in', async () => {
      await setup();

      component.form.controls.title.setValue('Hallelujah');
      fixture.detectChanges();

      expect(saveButton()?.disabled).toBe(false);
    });

    it('should show an error only after the field was touched', async () => {
      await setup();
      expect(el().querySelector('[role="alert"]')).toBeNull();

      component.form.controls.title.markAsTouched();
      fixture.detectChanges();

      expect(el().querySelector('[role="alert"]')?.textContent).toContain('required');
    });

    it('should report values that are too long with the limit', async () => {
      await setup();

      component.form.controls.title.setValue('x'.repeat(201));
      component.form.controls.title.markAsTouched();

      expect(component.errorFor('title')).toBe('Must not exceed 200 characters.');
    });

    it('should accept only http and https reference links', async () => {
      await setup();
      const link = component.form.controls.referenceLink;
      link.markAsTouched();

      link.setValue('www.example.com');
      expect(component.errorFor('referenceLink')).toBe(
        'Must be a link starting with http:// or https://.',
      );

      link.setValue('https://example.com/watch?v=1');
      expect(component.errorFor('referenceLink')).toBeNull();

      link.setValue('');
      expect(component.errorFor('referenceLink')).toBeNull();
    });

    it('should reject an implausible or fractional release year', async () => {
      await setup();
      const year = component.form.controls.releaseYear;
      year.markAsTouched();

      year.setValue(3000);
      expect(component.errorFor('releaseYear')).toContain('or earlier');

      year.setValue(99);
      expect(component.errorFor('releaseYear')).toContain('or later');

      year.setValue(1999.5);
      expect(component.errorFor('releaseYear')).toBe('Must be a whole number.');

      year.setValue(1999);
      expect(component.errorFor('releaseYear')).toBeNull();
    });
  });

  describe('save', () => {
    it('should not call the backend and should reveal all errors when the form is invalid', async () => {
      await setup();

      component.submit();

      expect(createSong).not.toHaveBeenCalled();
      expect(component.form.controls.title.touched).toBe(true);
    });

    it('should send a trimmed draft with blank optional fields as null', async () => {
      await setup();
      component.form.setValue({
        title: '  Hallelujah ',
        artist: ' Jeff Buckley ',
        referenceLink: ' ',
        notes: '',
        releaseYear: 1994,
        genre: ' Folk ',
        language: '',
        album: ' Grace',
      });

      component.submit();

      expect(createSong).toHaveBeenCalledWith({
        title: 'Hallelujah',
        artist: 'Jeff Buckley',
        referenceLink: null,
        notes: null,
        releaseYear: 1994,
        genre: 'Folk',
        language: null,
        album: 'Grace',
      });
    });

    it('should send an empty artist as an empty string, as the contract is non-null', async () => {
      await setup();
      component.form.controls.title.setValue('Untitled');

      component.submit();

      expect(createSong.mock.calls[0][0].artist).toBe('');
    });

    it('should go to the detail page of the new song', async () => {
      await setup();
      component.form.controls.title.setValue('Song 2');

      component.submit();

      expect(navigate).toHaveBeenCalledWith(['/songs', TestSongs[2].id]);
      expect(component.saving()).toBe(false);
    });

    it('should ignore a second submit while saving', async () => {
      await setup();
      createSong.mockReturnValue(new Observable<Song>());
      component.form.controls.title.setValue('Song');

      component.submit();
      component.submit();

      expect(createSong).toHaveBeenCalledTimes(1);
      expect(component.saving()).toBe(true);
    });

    it('should stay on the form and show the error when the backend refuses', async () => {
      await setup();
      const store = TestBed.inject(SongStore);
      createSong.mockImplementation(() => {
        store.setError('The backend rejected the song: Title is required.');
        return throwError(() => new Error('400'));
      });
      component.form.controls.title.setValue('Song');

      component.submit();
      fixture.detectChanges();

      expect(navigate).not.toHaveBeenCalled();
      expect(component.saving()).toBe(false);
      expect(el().textContent).toContain('The backend rejected the song: Title is required.');
      expect(component.form.controls.title.value).toBe('Song');
    });
  });

  describe('cancel', () => {
    it('should leave without asking when nothing was entered', async () => {
      await setup();

      cancelButton()?.click();
      await fixture.whenStable();

      expect(dialog()?.hasAttribute('open')).toBe(false);
      expect(navigate).toHaveBeenCalledWith(['/songs']);
    });

    it('should leave without asking when the input was deleted again', async () => {
      await setup();
      component.form.controls.title.setValue('Typo');
      component.form.controls.title.setValue('  ');

      await component.cancel();

      expect(navigate).toHaveBeenCalledWith(['/songs']);
    });

    it('should ask first when something was entered, and leave on confirmation', async () => {
      await setup();
      component.form.controls.album.setValue('Grace');

      const done = component.cancel();
      expect(dialog()?.hasAttribute('open')).toBe(true);
      expect(navigate).not.toHaveBeenCalled();

      dialog()?.close('confirm');
      await done;

      expect(navigate).toHaveBeenCalledWith(['/songs']);
    });

    it('should stay on the form when the question is dismissed', async () => {
      await setup();
      component.form.controls.releaseYear.setValue(1994);

      const done = component.cancel();
      dialog()?.close('cancel');
      await done;

      expect(navigate).not.toHaveBeenCalled();
      expect(component.form.controls.releaseYear.value).toBe(1994);
    });
  });
});
