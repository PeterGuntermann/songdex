import {
  Component,
  computed,
  effect,
  inject,
  type OnInit,
  signal,
  untracked,
  viewChild,
} from '@angular/core';
import {
  type AbstractControl,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  type ValidationErrors,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { type Song, type SongDraft, SongLimits } from '../models/song';
import { SongService } from '../services/song.service';
import { TagService } from '../services/tag.service';
import { ConfirmDialogComponent } from '../shared/confirm-dialog/confirm-dialog.component';
import type { ConfirmsLeave } from '../shared/unsaved-changes.guard';
import { SongStore } from '../store/song.store';
import { TagStore } from '../store/tag.store';
import { TaginputComponent } from '../taginput/taginput.component';

type FieldName =
  | 'title'
  | 'artist'
  | 'referenceLink'
  | 'notes'
  | 'releaseYear'
  | 'genre'
  | 'language'
  | 'album';

/** The validation errors the form's validators can produce. */
type FieldErrors = {
  required?: true;
  maxlength?: { requiredLength: number };
  pattern?: unknown;
  integer?: true;
  min?: { min: number };
  max?: { max: number };
};

/** `Validators.required` accepts a string of spaces; the backend does not. */
function notBlank(control: AbstractControl<string>): ValidationErrors | null {
  return control.value.trim().length === 0 ? { required: true } : null;
}

function integer(control: AbstractControl<number | null>): ValidationErrors | null {
  const value = control.value;
  return value === null || Number.isInteger(value) ? null : { integer: true };
}

/** Blank optional text becomes `null`, as the backend would do anyway. */
function nullIfBlank(value: string): string | null {
  const trimmed = value.trim();
  return trimmed.length === 0 ? null : trimmed;
}

function sameDraft(a: SongDraft, b: SongDraft): boolean {
  const sameTags = a.tags.length === b.tags.length && a.tags.every((tag, i) => tag === b.tags[i]);
  return (
    sameTags &&
    (Object.keys(a) as (keyof SongDraft)[])
      .filter((key) => key !== 'tags')
      .every((key) => a[key] === b[key])
  );
}

/**
 * Creates a song on `songs/new` and edits one on `songs/:songId/edit`. Saving an edit always sends
 * the full draft (PUT), never only the changed fields.
 */
@Component({
  selector: 'app-songform',
  standalone: true,
  imports: [ReactiveFormsModule, ConfirmDialogComponent, TaginputComponent],
  templateUrl: './songform.component.html',
  styleUrl: './songform.component.scss',
})
export class SongformComponent implements OnInit, ConfirmsLeave {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly router = inject(Router);
  private readonly songService = inject(SongService);
  private readonly tagService = inject(TagService);
  readonly songStore = inject(SongStore);
  readonly tagStore = inject(TagStore);

  /** The song being edited, or `null` when a new one is created. */
  private readonly songId = inject(ActivatedRoute).snapshot.paramMap.get('songId');
  readonly editing = this.songId !== null;

  readonly limits = SongLimits;
  readonly saving = signal(false);
  readonly saveError = signal<string | null>(null);
  /** Whether the form can be shown — in edit mode only once it has been filled with the song. */
  readonly ready = signal(!this.editing);

  readonly heading = this.editing ? 'Edit song' : 'New song';
  readonly leaveHeading = this.editing ? 'Discard your changes?' : 'Discard this song?';
  readonly leaveMessage = this.editing
    ? 'Your changes have not been saved and will be lost.'
    : 'Your input has not been saved and will be lost.';

  private readonly song = computed(() =>
    this.songId === null ? undefined : this.songStore.getSongById(this.songId),
  );

  private readonly confirmDialog = viewChild.required(ConfirmDialogComponent);
  /** Absent while the form is not shown yet. */
  private readonly tagInput = viewChild(TaginputComponent);

  readonly form = this.fb.group({
    title: ['', [notBlank, Validators.maxLength(SongLimits.title)]],
    artist: ['', Validators.maxLength(SongLimits.artist)],
    referenceLink: [
      '',
      [
        Validators.maxLength(SongLimits.referenceLink),
        Validators.pattern(/^\s*$|^\s*https?:\/\/\S+\s*$/),
      ],
    ],
    notes: ['', Validators.maxLength(SongLimits.notes)],
    releaseYear: this.fb.control<number | null>(null, [
      Validators.min(1000),
      Validators.max(new Date().getFullYear() + 1),
      integer,
    ]),
    genre: ['', Validators.maxLength(SongLimits.genre)],
    language: ['', Validators.maxLength(SongLimits.language)],
    album: ['', Validators.maxLength(SongLimits.album)],
    tags: this.fb.control<string[]>([]),
  });

  /**
   * The normalised draft the form started from. Unsaved changes are measured against it rather
   * than with `dirty`, so input that was typed and reverted again counts as no change.
   */
  private baseline = this.toDraft();

  constructor() {
    // Fills the form once the song is in the store — at once, or when a deep-link fetch lands.
    // Only once: later store updates (such as our own save) must not overwrite the user's input.
    effect(() => {
      const song = this.song();
      if (song && !untracked(this.ready)) {
        untracked(() => this.fill(song));
      }
    });
  }

  ngOnInit(): void {
    // Always refreshed: tags may have been created by saving another song since the last visit.
    this.tagService.fetchTags();

    if (this.songStore.songCount() === 0) {
      // Deep link: the catalogue is needed for the autocompletion and holds the song to edit.
      if (!this.songStore.loading()) {
        this.songService.fetchSongs();
      }
    } else if (this.songId !== null && !this.song()) {
      this.songService.fetchSong(this.songId);
    }
  }

  /** The message to show under a field, or `null` while it is untouched or valid. */
  errorFor(name: FieldName): string | null {
    const control = this.form.controls[name];
    if (!control.touched || !control.errors) {
      return null;
    }
    const errors = control.errors as FieldErrors;
    if (errors.required) {
      return 'This field is required.';
    }
    if (errors.maxlength) {
      return `Must not exceed ${errors.maxlength.requiredLength} characters.`;
    }
    if (errors.pattern) {
      return 'Must be a link starting with http:// or https://.';
    }
    if (errors.integer) {
      return 'Must be a whole number.';
    }
    if (errors.min) {
      return `Must be ${errors.min.min} or later.`;
    }
    if (errors.max) {
      return `Must be ${errors.max.max} or earlier.`;
    }
    return 'This value is not valid.';
  }

  submit(): void {
    // A name still in the tag field counts as meant to be added; one that is too long blocks.
    if (this.tagInput()?.commitPending() === false) {
      return;
    }
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    if (this.saving()) {
      return;
    }

    this.saving.set(true);
    this.saveError.set(null);
    const draft = this.toDraft();
    const request =
      this.songId === null
        ? this.songService.createSong(draft)
        : this.songService.updateSong(this.songId, draft);
    request.subscribe({
      next: (song) => {
        this.saving.set(false);
        // Saved: nothing left for the leave guard to ask about.
        this.baseline = draft;
        void this.router.navigate(['/songs', song.id]);
      },
      error: () => {
        this.saving.set(false);
        this.saveError.set(this.songStore.error());
      },
    });
  }

  /** Back to where the form was opened from; the leave guard asks if there is unsaved input. */
  async cancel(): Promise<void> {
    await this.router.navigate(this.songId === null ? ['/songs'] : ['/songs', this.songId]);
  }

  /** Called by `unsavedChangesGuard` on every navigation away from the form. */
  confirmLeave(): boolean | Promise<boolean> {
    return this.hasUnsavedChanges() ? this.confirmDialog().open() : true;
  }

  private hasUnsavedChanges(): boolean {
    return (
      this.ready() &&
      (!sameDraft(this.toDraft(), this.baseline) || this.tagInput()?.hasPending() === true)
    );
  }

  private fill(song: Song): void {
    this.form.reset({
      title: song.title,
      artist: song.artist,
      referenceLink: song.referenceLink ?? '',
      notes: song.notes ?? '',
      releaseYear: song.releaseYear,
      genre: song.genre ?? '',
      language: song.language ?? '',
      album: song.album ?? '',
      tags: song.tags.map((tag) => tag.name),
    });
    this.baseline = this.toDraft();
    this.ready.set(true);
  }

  private toDraft(): SongDraft {
    const value = this.form.getRawValue();
    return {
      title: value.title.trim(),
      artist: value.artist.trim(),
      releaseYear: value.releaseYear,
      referenceLink: nullIfBlank(value.referenceLink),
      notes: nullIfBlank(value.notes),
      genre: nullIfBlank(value.genre),
      language: nullIfBlank(value.language),
      album: nullIfBlank(value.album),
      tags: value.tags,
    };
  }
}
