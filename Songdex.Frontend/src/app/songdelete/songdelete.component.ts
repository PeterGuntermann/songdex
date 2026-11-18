import { Component, inject, input, output, signal, viewChild } from '@angular/core';
import type { Song } from '../models/song';
import { SongService } from '../services/song.service';
import { ConfirmDialogComponent } from '../shared/confirm-dialog/confirm-dialog.component';
import { SongStore } from '../store/song.store';

/**
 * A delete button that asks for confirmation, naming the song, before it deletes. Used in the song
 * list and on the detail page; the host decides where to go and how to show a failure.
 */
@Component({
  selector: 'app-songdelete',
  standalone: true,
  imports: [ConfirmDialogComponent],
  templateUrl: './songdelete.component.html',
  styleUrl: './songdelete.component.scss',
  host: {
    // Inside a clickable table row, neither the button nor the dialog must open the song.
    '(click)': '$event.stopPropagation()',
  },
})
export class SongdeleteComponent {
  private readonly songService = inject(SongService);
  private readonly songStore = inject(SongStore);

  readonly song = input.required<Song>();
  /** Emits once the song is deleted in the backend and gone from the store. */
  readonly deleted = output<void>();
  /** Emits the error message when the backend refused or could not be reached. */
  readonly failed = output<string>();
  readonly deleting = signal(false);

  private readonly confirmDialog = viewChild.required(ConfirmDialogComponent);

  async delete(): Promise<void> {
    if (this.deleting() || !(await this.confirmDialog().open())) {
      return;
    }
    this.deleting.set(true);
    this.songService.deleteSong(this.song().id).subscribe({
      next: () => {
        this.deleting.set(false);
        this.deleted.emit();
      },
      error: () => {
        this.deleting.set(false);
        this.failed.emit(this.songStore.error() ?? 'The song could not be deleted.');
      },
    });
  }
}
