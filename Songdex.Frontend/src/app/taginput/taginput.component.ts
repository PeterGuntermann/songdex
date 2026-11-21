import { Component, computed, forwardRef, input, signal } from '@angular/core';
import {
  type ControlValueAccessor,
  FormControl,
  NG_VALUE_ACCESSOR,
  ReactiveFormsModule,
} from '@angular/forms';
import { normalizeTagName, TagLimits } from '../models/tag';

/**
 * Edits a list of tag names as chips. A name is added with Enter, a comma or the Add button, or
 * by picking a suggestion. Names that differ only in case count once, and a name matching a
 * suggestion takes the suggestion's spelling. The value is a plain `string[]`, so the component
 * plugs into a reactive form with `formControlName`.
 */
@Component({
  selector: 'app-taginput',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './taginput.component.html',
  styleUrl: './taginput.component.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => TaginputComponent),
      multi: true,
    },
  ],
})
export class TaginputComponent implements ControlValueAccessor {
  /** Existing tag names offered for autocompletion. */
  readonly suggestions = input<string[]>([]);

  readonly limit = TagLimits.name;
  readonly tags = signal<string[]>([]);
  readonly disabled = signal(false);
  readonly error = signal<string | null>(null);

  /** The name being typed. Not part of the value until it is added. */
  readonly pending = new FormControl('', { nonNullable: true });

  /** Suggestions not chosen yet. */
  readonly options = computed(() => {
    const chosen = new Set(this.tags().map(normalizeTagName));
    return this.suggestions().filter((name) => !chosen.has(normalizeTagName(name)));
  });

  private onChange: (tags: string[]) => void = () => {};
  onTouched: () => void = () => {};

  writeValue(tags: string[] | null): void {
    this.tags.set(tags ?? []);
  }

  registerOnChange(fn: (tags: string[]) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(disabled: boolean): void {
    this.disabled.set(disabled);
    if (disabled) {
      this.pending.disable();
    } else {
      this.pending.enable();
    }
  }

  /** Whether there is typed text that has not been added yet. */
  hasPending(): boolean {
    return this.pending.value.trim().length > 0;
  }

  /**
   * Adds the typed text, if any. Returns `false` when it cannot be added because it is too long;
   * the error is shown and the text stays in the field.
   */
  commitPending(): boolean {
    if (!this.add(this.pending.value)) {
      return false;
    }
    this.pending.setValue('');
    return true;
  }

  remove(name: string): void {
    this.update(this.tags().filter((tag) => tag !== name));
    this.onTouched();
  }

  onInput(event: Event): void {
    this.error.set(null);
    // Read from the element: the form control may not have seen this event yet.
    const value = (event.target as HTMLInputElement).value;
    this.pending.setValue(value);

    if (value.includes(',')) {
      const parts = value.split(',');
      const rest = parts.pop() ?? '';
      if (parts.every((part) => this.add(part))) {
        this.pending.setValue(rest);
      }
      return;
    }

    // Picking a datalist option fires an `input` event that is not a typed insertion: Chromium
    // sends a plain Event, Firefox an InputEvent of type insertReplacementText.
    const picked = !(event instanceof InputEvent) || event.inputType === 'insertReplacementText';
    if (picked && this.options().includes(value)) {
      this.commitPending();
    }
  }

  onEnter(event: Event): void {
    // Enter would otherwise submit the surrounding form.
    event.preventDefault();
    this.commitPending();
  }

  /** Returns `false` only when the name is too long; blanks and duplicates are dropped quietly. */
  private add(raw: string): boolean {
    const name = raw.trim();
    if (name.length === 0) {
      return true;
    }
    if (name.length > this.limit) {
      this.error.set(`A tag must not exceed ${this.limit} characters.`);
      return false;
    }

    const key = normalizeTagName(name);
    if (this.tags().some((tag) => normalizeTagName(tag) === key)) {
      return true;
    }
    const spelling = this.suggestions().find((s) => normalizeTagName(s) === key) ?? name;
    this.update([...this.tags(), spelling]);
    return true;
  }

  private update(tags: string[]): void {
    this.tags.set(tags);
    this.onChange(tags);
  }
}
