import { type ComponentFixture, TestBed } from '@angular/core/testing';
import { ConfirmDialogComponent } from './confirm-dialog.component';
import { stubDialog } from './dialog.testing';

describe('ConfirmDialogComponent', () => {
  let fixture: ComponentFixture<ConfirmDialogComponent>;
  let dialog: HTMLDialogElement;

  beforeEach(async () => {
    stubDialog();
    await TestBed.configureTestingModule({ imports: [ConfirmDialogComponent] }).compileComponents();

    fixture = TestBed.createComponent(ConfirmDialogComponent);
    fixture.componentRef.setInput('heading', 'Discard?');
    fixture.componentRef.setInput('message', 'Gone for good.');
    fixture.detectChanges();
    dialog = fixture.nativeElement.querySelector('dialog');
  });

  it('should show heading, message and the default labels', () => {
    const text = fixture.nativeElement.textContent;

    expect(text).toContain('Discard?');
    expect(text).toContain('Gone for good.');
    expect(text).toContain('Keep editing');
    expect(text).toContain('Discard');
  });

  it('should open the dialog', () => {
    void fixture.componentInstance.open();

    expect(dialog.hasAttribute('open')).toBe(true);
  });

  it('should resolve true when confirmed', async () => {
    const answer = fixture.componentInstance.open();

    dialog.close('confirm');

    expect(await answer).toBe(true);
  });

  it('should resolve false when cancelled', async () => {
    const answer = fixture.componentInstance.open();

    dialog.close('cancel');

    expect(await answer).toBe(false);
  });

  it('should resolve false when closed without an answer, e.g. by Escape', async () => {
    const answer = fixture.componentInstance.open();

    dialog.close();

    expect(await answer).toBe(false);
  });

  it('should not remember a previous confirmation when opened again', async () => {
    const first = fixture.componentInstance.open();
    dialog.close('confirm');
    await first;

    const second = fixture.componentInstance.open();
    dialog.close();

    expect(await second).toBe(false);
  });
});
