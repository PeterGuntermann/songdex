import { type ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter, Router } from '@angular/router';
import { MockProvider } from 'ng-mocks';
import { Observable, of, throwError } from 'rxjs';
import type { Mock } from 'vitest';
import type { Song, SongDraft } from '../models/song';
import type { Tag } from '../models/tag';
import { SongService } from '../services/song.service';
import { TagService } from '../services/tag.service';
import { stubDialog } from '../shared/confirm-dialog/dialog.testing';
import { SONG_STATE, type SongState, SongStore } from '../store/song.store';
import { draftOf, songFrom, TestSongs } from '../store/song.store.testdata';
import { TAG_STATE, type TagState } from '../store/tag.store';
import { SongformComponent } from './songform.component';

const StoredTags: Tag[] = [
  { id: 't1', name: 'Acoustic' },
  { id: 't2', name: 'Rehearsed' },
  { id: 't3', name: 'Summer party' },
];

describe('SongformComponent', () => {
  let fixture: ComponentFixture<SongformComponent>;
  let component: SongformComponent;
  let createSong: Mock<(draft: SongDraft) => Observable<Song>>;
  let updateSong: Mock<(id: string, draft: SongDraft) => Observable<Song>>;
  let fetchSongs: Mock<() => void>;
  let fetchSong: Mock<(id: string) => void>;
  let fetchTags: Mock<() => void>;
  let navigate: Mock<Router['navigate']>;

  type Options = Partial<SongState> & { songId?: string };

  const setup = async (allSongs: Song[] = [TestSongs[3]], options: Options = {}) => {
    const { songId, ...state } = options;
    stubDialog();
    createSong = vi.fn<(draft: SongDraft) => Observable<Song>>(() => of(TestSongs[2]));
    updateSong = vi.fn<(id: string, draft: SongDraft) => Observable<Song>>((id, draft) =>
      of(songFrom(id, draft)),
    );
    fetchSongs = vi.fn<() => void>();
    fetchSong = vi.fn<(id: string) => void>();
    fetchTags = vi.fn<() => void>();
    await TestBed.configureTestingModule({
      imports: [SongformComponent],
      providers: [
        provideRouter([]),
        MockProvider(SongService, { createSong, updateSong, fetchSongs, fetchSong }),
        MockProvider(TagService, { fetchTags }),
        { provide: TAG_STATE, useValue: { allTags: StoredTags } satisfies TagState },
        MockProvider(ActivatedRoute, {
          snapshot: { paramMap: convertToParamMap(songId ? { songId } : {}) },
        } as Partial<ActivatedRoute>),
        {
          provide: SONG_STATE,
          useValue: { allSongs, loading: false, error: null, ...state } satisfies SongState,
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
  // The confirm dialog carries a form of its own.
  const songForm = () => el().querySelector('form[novalidate]');
  const chips = () =>
    Array.from(el().querySelectorAll('app-taginput li span')).map((s) => s.textContent?.trim());
  const tagField = () => el().querySelector<HTMLInputElement>('app-taginput input');
  const typeTag = (text: string) => {
    const field = tagField();
    if (!field) {
      throw new Error('tag field missing');
    }
    field.value = text;
    field.dispatchEvent(new InputEvent('input', { inputType: 'insertText' }));
    fixture.detectChanges();
  };

  describe('layout', () => {
    it('should group the fields into identity, references, catalogue and tags', async () => {
      await setup();

      const legends = Array.from(el().querySelectorAll('legend')).map((l) => l.textContent?.trim());
      expect(legends).toEqual(['Identity', 'References', 'Catalogue', 'Tags']);
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
        tags: ['Acoustic'],
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
        tags: ['Acoustic'],
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

  describe('tags', () => {
    it('should refresh the tag catalogue every time the form opens', async () => {
      await setup();

      expect(fetchTags).toHaveBeenCalledTimes(1);
    });

    it('should offer the stored tags for autocompletion', async () => {
      await setup();

      const options = Array.from(
        el().querySelectorAll<HTMLOptionElement>('#tag-options option'),
      ).map((o) => o.value);
      expect(options).toEqual(['Acoustic', 'Rehearsed', 'Summer party']);
    });

    it('should send the added tags as names', async () => {
      await setup();
      component.form.controls.title.setValue('Song');
      typeTag('acoustic,brand new,');

      component.submit();

      expect(createSong.mock.calls[0][0].tags).toEqual(['Acoustic', 'brand new']);
    });

    it('should add a name still in the tag field when saving', async () => {
      await setup();
      component.form.controls.title.setValue('Song');
      typeTag('Unsaved');

      component.submit();

      expect(createSong.mock.calls[0][0].tags).toEqual(['Unsaved']);
    });

    it('should not save while the tag field holds a name that is too long', async () => {
      await setup();
      component.form.controls.title.setValue('Song');
      typeTag('x'.repeat(51));

      component.submit();
      fixture.detectChanges();

      expect(createSong).not.toHaveBeenCalled();
      expect(el().querySelector('app-taginput [role="alert"]')?.textContent).toContain('50');
    });

    it('should ask before leaving with a name still in the tag field', async () => {
      await setup();
      typeTag('Unsaved');

      expect(component.confirmLeave()).toBeInstanceOf(Promise);
    });

    it('should replace the tag set on edit, removing a chip', async () => {
      await setup([TestSongs[3]], { songId: TestSongs[3].id });

      el().querySelector<HTMLButtonElement>('[aria-label="Remove tag Acoustic"]')?.click();
      fixture.detectChanges();
      component.submit();

      expect(updateSong.mock.calls[0][1].tags).toEqual(['Rehearsed']);
    });

    it('should count a removed tag as an unsaved change', async () => {
      await setup([TestSongs[3]], { songId: TestSongs[3].id });

      el().querySelector<HTMLButtonElement>('[aria-label="Remove tag Rehearsed"]')?.click();

      expect(component.confirmLeave()).toBeInstanceOf(Promise);
    });
  });

  describe('cancel', () => {
    // The question itself is asked by the leave guard; see 'leaving' below.
    it('should go back to the list', async () => {
      await setup();

      cancelButton()?.click();
      await fixture.whenStable();

      expect(navigate).toHaveBeenCalledWith(['/songs']);
    });
  });

  describe('leaving', () => {
    it('should let go without asking when nothing was entered', async () => {
      await setup();

      expect(component.confirmLeave()).toBe(true);
      expect(dialog()?.hasAttribute('open')).toBe(false);
    });

    it('should let go without asking when the input was deleted again', async () => {
      await setup();
      component.form.controls.title.setValue('Typo');
      component.form.controls.title.setValue('  ');

      expect(component.confirmLeave()).toBe(true);
    });

    it('should ask first when something was entered, and let go on confirmation', async () => {
      await setup();
      component.form.controls.album.setValue('Grace');

      const answer = component.confirmLeave();
      expect(dialog()?.hasAttribute('open')).toBe(true);

      dialog()?.close('confirm');

      expect(await answer).toBe(true);
    });

    it('should stay on the form when the question is dismissed', async () => {
      await setup();
      component.form.controls.releaseYear.setValue(1994);

      const answer = component.confirmLeave();
      dialog()?.close('cancel');

      expect(await answer).toBe(false);
      expect(component.form.controls.releaseYear.value).toBe(1994);
    });

    it('should not ask again once the input has been saved', async () => {
      await setup();
      component.form.controls.title.setValue('Song 2');

      component.submit();

      expect(component.confirmLeave()).toBe(true);
    });

    it('should keep asking when saving failed', async () => {
      await setup();
      createSong.mockReturnValue(throwError(() => new Error('500')));
      component.form.controls.title.setValue('Song 2');

      component.submit();

      expect(component.confirmLeave()).toBeInstanceOf(Promise);
    });
  });

  describe('edit mode', () => {
    const song = TestSongs[3];
    const id = song.id;
    const draftOfSong = draftOf(song);
    const editSetup = (allSongs: Song[] = [TestSongs[1], song], options: Options = {}) =>
      setup(allSongs, { songId: id, ...options });

    it('should show the same form, prefilled with the song from the store', async () => {
      await editSetup();

      expect(el().querySelector('h2')?.textContent).toBe('Edit song');
      expect(component.form.getRawValue()).toEqual({
        title: 'Song 3',
        artist: 'Artist 3',
        referenceLink: 'http://example.com',
        notes: 'First line\nSecond line',
        releaseYear: null,
        genre: 'Pop',
        language: 'English',
        album: 'Album 3',
        tags: ['Acoustic', 'Rehearsed'],
      });
      expect(el().querySelector<HTMLInputElement>('input[formControlName="title"]')?.value).toBe(
        'Song 3',
      );
      expect(chips()).toEqual(['Acoustic', 'Rehearsed']);
      expect(fetchSong).not.toHaveBeenCalled();
      expect(fetchSongs).not.toHaveBeenCalled();
    });

    it('should turn missing optional values into empty fields', async () => {
      await editSetup([TestSongs[1]], { songId: '1' });

      expect(component.form.controls.album.value).toBe('');
      expect(component.form.controls.releaseYear.value).toBe(1999);
    });

    it('should load the catalogue on a deep link and fill the form once it arrives', async () => {
      await editSetup([], { loading: true });
      expect(el().textContent).toContain('Loading song');
      expect(songForm()).toBeNull();

      TestBed.inject(SongStore).setSongs([TestSongs[1], song]);
      fixture.detectChanges();

      expect(songForm()).not.toBeNull();
      expect(component.form.controls.title.value).toBe('Song 3');
    });

    it('should start loading the catalogue on a deep link', async () => {
      await editSetup([]);

      expect(fetchSongs).toHaveBeenCalled();
    });

    it('should fetch only the song when the catalogue is there without it', async () => {
      await editSetup([TestSongs[1]]);

      expect(fetchSong).toHaveBeenCalledWith(id);
      expect(fetchSongs).not.toHaveBeenCalled();
    });

    it('should report a song that does not exist', async () => {
      await editSetup([TestSongs[1]], { error: 'This song no longer exists.' });

      expect(songForm()).toBeNull();
      expect(el().querySelector('[role="alert"]')?.textContent).toContain(
        'This song no longer exists.',
      );
    });

    it('should report a song that is missing from a loaded catalogue', async () => {
      await editSetup([TestSongs[1]]);

      expect(songForm()).toBeNull();
      expect(el().textContent).toContain('This song no longer exists.');
    });

    it('should not overwrite the input when the stored song changes later', async () => {
      await editSetup();
      component.form.controls.title.setValue('Mine');

      TestBed.inject(SongStore).updateSong({ ...song, title: 'Theirs' });
      fixture.detectChanges();

      expect(component.form.controls.title.value).toBe('Mine');
    });

    it('should send the full draft, not only the changed field', async () => {
      await editSetup();
      component.form.controls.title.setValue(' Renamed ');

      component.submit();

      expect(updateSong).toHaveBeenCalledWith(id, { ...draftOfSong, title: 'Renamed' });
      expect(createSong).not.toHaveBeenCalled();
    });

    it('should clear a field that was emptied', async () => {
      await editSetup();
      component.form.controls.album.setValue('');

      component.submit();

      expect(updateSong.mock.calls[0][1].album).toBeNull();
    });

    it('should go back to the detail page after saving', async () => {
      await editSetup();
      component.form.controls.title.setValue('Renamed');

      component.submit();

      expect(navigate).toHaveBeenCalledWith(['/songs', id]);
      expect(component.confirmLeave()).toBe(true);
    });

    it('should stay on the form and show the error when the backend refuses', async () => {
      await editSetup();
      const store = TestBed.inject(SongStore);
      updateSong.mockImplementation(() => {
        store.setError('This song no longer exists.');
        return throwError(() => new Error('404'));
      });
      component.form.controls.title.setValue('Renamed');

      component.submit();
      fixture.detectChanges();

      expect(navigate).not.toHaveBeenCalled();
      expect(songForm()).not.toBeNull();
      expect(el().textContent).toContain('This song no longer exists.');
    });

    it('should go back to the detail page on cancel', async () => {
      await editSetup();

      await component.cancel();

      expect(navigate).toHaveBeenCalledWith(['/songs', id]);
    });

    it('should let go without asking while the song is unchanged', async () => {
      await editSetup();

      expect(component.confirmLeave()).toBe(true);
    });

    it('should let go without asking when a change was reverted', async () => {
      await editSetup();
      component.form.controls.genre.setValue('Rock');
      component.form.controls.genre.setValue(' Pop ');

      expect(component.confirmLeave()).toBe(true);
    });

    it('should ask about changed values, naming them as changes', async () => {
      await editSetup();
      component.form.controls.notes.setValue('');

      const answer = component.confirmLeave();
      fixture.detectChanges();

      expect(dialog()?.hasAttribute('open')).toBe(true);
      expect(dialog()?.textContent).toContain('Discard your changes?');
      dialog()?.close('cancel');
      expect(await answer).toBe(false);
    });

    it('should let go without asking while the song is still loading', async () => {
      await editSetup([], { loading: true });

      expect(component.confirmLeave()).toBe(true);
    });
  });
});
