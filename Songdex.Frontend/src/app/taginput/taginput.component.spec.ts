import { Component } from '@angular/core';
import { type ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { TaginputComponent } from './taginput.component';

@Component({
  standalone: true,
  imports: [ReactiveFormsModule, TaginputComponent],
  template: `<app-taginput [formControl]="tags" [suggestions]="suggestions" />`,
})
class HostComponent {
  readonly tags = new FormControl<string[]>(['Rehearsed'], { nonNullable: true });
  suggestions = ['Acoustic', 'Rehearsed', 'Summer party'];
}

describe('TaginputComponent', () => {
  let fixture: ComponentFixture<HostComponent>;
  let host: HostComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [HostComponent] }).compileComponents();
    fixture = TestBed.createComponent(HostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  const el = (): HTMLElement => fixture.nativeElement;
  const field = () => el().querySelector('input') as HTMLInputElement;
  const chips = () =>
    Array.from(el().querySelectorAll('li span')).map((s) => s.textContent?.trim());
  const options = () =>
    Array.from(el().querySelectorAll<HTMLOptionElement>('datalist option')).map((o) => o.value);
  const type = (
    text: string,
    event: Event = new InputEvent('input', { inputType: 'insertText' }),
  ) => {
    field().value = text;
    field().dispatchEvent(event);
    fixture.detectChanges();
  };
  const pressEnter = () => {
    const enter = new KeyboardEvent('keydown', { key: 'Enter', cancelable: true });
    field().dispatchEvent(enter);
    fixture.detectChanges();
    return enter;
  };
  const addButton = () =>
    Array.from(el().querySelectorAll('button')).find((b) => b.textContent?.trim() === 'Add');

  it('should show the value as chips', () => {
    expect(chips()).toEqual(['Rehearsed']);
  });

  it('should add a typed name on Enter without submitting a form', () => {
    type('Brand new');

    const enter = pressEnter();

    expect(enter.defaultPrevented).toBe(true);
    expect(host.tags.value).toEqual(['Rehearsed', 'Brand new']);
    expect(field().value).toBe('');
  });

  it('should add a typed name with the Add button', () => {
    type('Brand new');

    addButton()?.click();
    fixture.detectChanges();

    expect(host.tags.value).toEqual(['Rehearsed', 'Brand new']);
  });

  it('should add every name before a comma and keep typing after it', () => {
    type('one, two ,thr');

    expect(host.tags.value).toEqual(['Rehearsed', 'one', 'two']);
    expect(field().value).toBe('thr');
  });

  it('should take the spelling of a matching suggestion', () => {
    type('SUMMER PARTY');
    pressEnter();

    expect(host.tags.value).toEqual(['Rehearsed', 'Summer party']);
  });

  it('should drop a name that differs from a chosen one only in case', () => {
    type('rehearsed');
    pressEnter();

    expect(host.tags.value).toEqual(['Rehearsed']);
    expect(field().value).toBe('');
  });

  it('should ignore blank input', () => {
    type('   ');
    pressEnter();

    expect(host.tags.value).toEqual(['Rehearsed']);
  });

  it('should refuse a name that is too long and keep it in the field', () => {
    type('x'.repeat(51));
    pressEnter();

    expect(host.tags.value).toEqual(['Rehearsed']);
    expect(field().value).toBe('x'.repeat(51));
    expect(el().querySelector('[role="alert"]')?.textContent).toContain(
      'must not exceed 50 characters',
    );
  });

  it('should add a suggestion as soon as it is picked from the list', () => {
    // Chromium reports picking a datalist option as a plain Event.
    type('Acoustic', new Event('input'));

    expect(host.tags.value).toEqual(['Rehearsed', 'Acoustic']);
  });

  it('should not add a suggestion while it is merely typed', () => {
    type('Acoustic');

    expect(host.tags.value).toEqual(['Rehearsed']);
  });

  it('should offer only the suggestions not chosen yet', () => {
    expect(options()).toEqual(['Acoustic', 'Summer party']);
  });

  it('should remove a chip and mark the control as touched', () => {
    el().querySelector<HTMLButtonElement>('[aria-label="Remove tag Rehearsed"]')?.click();
    fixture.detectChanges();

    expect(host.tags.value).toEqual([]);
    expect(host.tags.touched).toBe(true);
    expect(chips()).toEqual([]);
  });

  it('should follow a value written by the form', () => {
    host.tags.setValue(['Acoustic', 'Summer party']);
    fixture.detectChanges();

    expect(chips()).toEqual(['Acoustic', 'Summer party']);
  });

  it('should disable its controls with the form control', () => {
    host.tags.disable();
    fixture.detectChanges();

    expect(field().disabled).toBe(true);
    expect(addButton()?.disabled).toBe(true);
  });
});
