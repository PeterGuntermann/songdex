import { Component, computed, inject, type OnInit, signal, viewChild } from '@angular/core';
import {
  type AbstractControl,
  FormControl,
  ReactiveFormsModule,
  type ValidationErrors,
  Validators,
} from '@angular/forms';
import type { Observable } from 'rxjs';
import { TagLimits, type TagSummary } from '../models/tag';
import { TagService } from '../services/tag.service';
import { ConfirmDialogComponent } from '../shared/confirm-dialog/confirm-dialog.component';
import { TagStore } from '../store/tag.store';

/** `Validators.required` accepts a string of spaces; the backend does not. */
function notBlank(control: AbstractControl<string>): ValidationErrors | null {
  return control.value.trim().length === 0 ? { required: true } : null;
}

/**
 * Lists every tag with its song count and lets the user rename, merge and delete tags. Unused tags
 * are dimmed and marked. At most one row is in rename or merge mode at a time.
 */
@Component({
  selector: 'app-taglist',
  standalone: true,
  imports: [ReactiveFormsModule, ConfirmDialogComponent],
  templateUrl: './taglist.component.html',
  styleUrl: './taglist.component.scss',
})
export class TaglistComponent implements OnInit {
  private readonly tagService = inject(TagService);
  readonly tagStore = inject(TagStore);

  readonly limit = TagLimits.name;
  /** The tag being renamed. */
  readonly editingId = signal<string | null>(null);
  /** The tag whose merge target is being picked. */
  readonly mergingId = signal<string | null>(null);
  readonly busy = signal(false);

  readonly nameControl = new FormControl('', {
    nonNullable: true,
    validators: [notBlank, Validators.maxLength(TagLimits.name)],
  });
  readonly mergeTarget = new FormControl('', { nonNullable: true });

  /** The tags a confirmation is about; they fill the dialog texts. */
  private readonly pending = signal<TagSummary | null>(null);
  private readonly pendingTarget = signal<TagSummary | null>(null);

  readonly deleteMessage = computed(() => {
    const tag = this.pending();
    if (!tag) {
      return '';
    }
    const usage =
      tag.songCount === 0
        ? 'No song carries it.'
        : `It will be removed from ${tag.songCount} ${tag.songCount === 1 ? 'song' : 'songs'}.`;
    return `“${tag.name}”: ${usage} This cannot be undone.`;
  });

  readonly mergeMessage = computed(() => {
    const source = this.pending();
    const target = this.pendingTarget();
    if (!source || !target) {
      return '';
    }
    return `Songs tagged “${source.name}” will be tagged “${target.name}” instead, and “${source.name}” will be deleted.`;
  });

  private readonly deleteDialog = viewChild.required<ConfirmDialogComponent>('deleteDialog');
  private readonly mergeDialog = viewChild.required<ConfirmDialogComponent>('mergeDialog');

  ngOnInit(): void {
    this.tagService.fetchTags();
  }

  retry(): void {
    this.tagService.fetchTags();
  }

  /** The tags the given one could be merged into. */
  othersThan(tag: TagSummary): TagSummary[] {
    return this.tagStore.sortedTags().filter((other) => other.id !== tag.id);
  }

  nameError(): string | null {
    const control = this.nameControl;
    if (!control.touched || !control.errors) {
      return null;
    }
    return control.hasError('required')
      ? 'A tag needs a name.'
      : `Must not exceed ${this.limit} characters.`;
  }

  startRename(tag: TagSummary): void {
    this.mergingId.set(null);
    this.nameControl.reset(tag.name);
    this.editingId.set(tag.id);
  }

  cancelRename(): void {
    this.editingId.set(null);
  }

  saveRename(tag: TagSummary, event?: Event): void {
    event?.preventDefault();
    if (this.nameControl.invalid) {
      this.nameControl.markAsTouched();
      return;
    }
    const name = this.nameControl.value.trim();
    if (name === tag.name) {
      this.cancelRename();
      return;
    }
    this.run(this.tagService.renameTag(tag.id, name), () => this.cancelRename());
  }

  startMerge(tag: TagSummary): void {
    this.editingId.set(null);
    this.mergeTarget.setValue('');
    this.mergingId.set(tag.id);
  }

  cancelMerge(): void {
    this.mergingId.set(null);
  }

  async merge(source: TagSummary): Promise<void> {
    const target = this.othersThan(source).find((tag) => tag.id === this.mergeTarget.value);
    if (!target) {
      return;
    }
    this.pending.set(source);
    this.pendingTarget.set(target);
    if (!(await this.mergeDialog().open())) {
      return;
    }
    this.run(this.tagService.mergeTags(source.id, target.id), () => this.cancelMerge());
  }

  async delete(tag: TagSummary): Promise<void> {
    this.pending.set(tag);
    if (!(await this.deleteDialog().open())) {
      return;
    }
    this.run(this.tagService.deleteTag(tag.id), () => {
      // The row is gone; nothing to reset.
    });
  }

  /** Runs a write; a failure is shown through the store's `error` above the table. */
  private run(request: Observable<unknown>, done: () => void): void {
    if (this.busy()) {
      return;
    }
    this.busy.set(true);
    request.subscribe({
      next: () => {
        this.busy.set(false);
        done();
      },
      error: () => this.busy.set(false),
    });
  }
}
