import type { CanDeactivateFn } from '@angular/router';

/** A routed component that may hold input the user has not saved yet. */
export interface ConfirmsLeave {
  /** Resolves `true` when the route may be left — right away, or after the user agreed. */
  confirmLeave(): boolean | Promise<boolean>;
}

/**
 * Asks before any in-app navigation leaves a component with unsaved input. Reloading or closing
 * the tab is deliberately not covered (no `beforeunload`).
 */
export const unsavedChangesGuard: CanDeactivateFn<ConfirmsLeave> = (component) =>
  component.confirmLeave();
