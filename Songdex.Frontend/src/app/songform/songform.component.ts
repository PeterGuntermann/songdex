import { Component, inject, type OnInit, signal, viewChild } from '@angular/core';
import {
  type AbstractControl,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  type ValidationErrors,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { type SongDraft, SongLimits } from '../models/song';
import { SongService } from '../services/song.service';
import { ConfirmDialogComponent } from '../shared/confirm-dialog/confirm-dialog.component';
import { SongStore } from '../store/song.store';

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

@Component({
  selector: 'app-songform',
  standalone: true,
  imports: [ReactiveFormsModule, ConfirmDialogComponent],
  templateUrl: './songform.component.html',
  styleUrl: './songform.component.scss',
})
export class SongformComponent implements OnInit {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly router = inject(Router);
  private readonly songService = inject(SongService);
  readonly songStore = inject(SongStore);

  readonly limits = SongLimits;
  readonly saving = signal(false);
  readonly saveError = signal<string | null>(null);

  private readonly confirmDialog = viewChild.required(ConfirmDialogComponent);

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
  });

  ngOnInit(): void {
    // Deep link to /songs/new: the catalogue is needed for the autocompletion.
    if (this.songStore.songCount() === 0 && !this.songStore.loading()) {
      this.songService.fetchSongs();
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
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    if (this.saving()) {
      return;
    }

    this.saving.set(true);
    this.saveError.set(null);
    this.songService.createSong(this.toDraft()).subscribe({
      next: (song) => {
        this.saving.set(false);
        void this.router.navigate(['/songs', song.id]);
      },
      error: () => {
        this.saving.set(false);
        this.saveError.set(this.songStore.error());
      },
    });
  }

  /** Leaves silently when nothing was entered, otherwise asks first. */
  async cancel(): Promise<void> {
    if (this.hasInput() && !(await this.confirmDialog().open())) {
      return;
    }
    await this.router.navigate(['/songs']);
  }

  /** Stricter than `dirty`: text that was typed and deleted again counts as nothing entered. */
  private hasInput(): boolean {
    const { releaseYear, ...texts } = this.form.getRawValue();
    return releaseYear !== null || Object.values(texts).some((value) => value.trim().length > 0);
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
    };
  }
}
