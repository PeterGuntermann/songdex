import { Component, type ElementRef, input, viewChild } from '@angular/core';

/**
 * A modal yes/no question on a native `<dialog>`. Call `open()` and await the answer; Escape, the
 * backdrop and the cancel button all answer `false`.
 */
@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  templateUrl: './confirm-dialog.component.html',
  styleUrl: './confirm-dialog.component.scss',
})
export class ConfirmDialogComponent {
  readonly heading = input.required<string>();
  readonly message = input.required<string>();
  readonly confirmLabel = input('Discard');
  readonly cancelLabel = input('Keep editing');

  private readonly dialog = viewChild.required<ElementRef<HTMLDialogElement>>('dialog');

  /** Shows the dialog and resolves with the answer once it is closed. */
  open(): Promise<boolean> {
    const dialog = this.dialog().nativeElement;
    return new Promise<boolean>((resolve) => {
      dialog.addEventListener('close', () => resolve(dialog.returnValue === 'confirm'), {
        once: true,
      });
      dialog.returnValue = 'cancel';
      dialog.showModal();
    });
  }
}
