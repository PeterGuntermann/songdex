/**
 * jsdom does not implement the modal part of `<dialog>`, so `showModal` and `close` are stubbed
 * with the behaviour the confirm dialog relies on: `close` fires a `close` event.
 */
export function stubDialog(): void {
  HTMLDialogElement.prototype.showModal = function (this: HTMLDialogElement) {
    this.setAttribute('open', '');
  };
  HTMLDialogElement.prototype.close = function (this: HTMLDialogElement, returnValue?: string) {
    if (returnValue !== undefined) {
      this.returnValue = returnValue;
    }
    this.removeAttribute('open');
    this.dispatchEvent(new Event('close'));
  };
}
