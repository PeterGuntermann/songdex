import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { routes } from '../app.routes';
import { type ConfirmsLeave, unsavedChangesGuard } from './unsaved-changes.guard';

@Component({ standalone: true, template: 'form' })
class FormStubComponent implements ConfirmsLeave {
  answer: boolean | Promise<boolean> = true;
  confirmLeave(): boolean | Promise<boolean> {
    return this.answer;
  }
}

@Component({ standalone: true, template: 'elsewhere' })
class ElsewhereStubComponent {}

describe('unsavedChangesGuard', () => {
  let harness: RouterTestingHarness;
  let form: FormStubComponent;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([
          { path: 'form', component: FormStubComponent, canDeactivate: [unsavedChangesGuard] },
          { path: 'elsewhere', component: ElsewhereStubComponent },
        ]),
      ],
    });
    harness = await RouterTestingHarness.create();
    form = await harness.navigateByUrl('/form', FormStubComponent);
  });

  it('should let the navigation through when the component agrees', async () => {
    await harness.navigateByUrl('/elsewhere');

    expect(TestBed.inject(Router).url).toBe('/elsewhere');
  });

  it('should cancel the navigation when the component refuses', async () => {
    form.answer = Promise.resolve(false);

    await harness.navigateByUrl('/elsewhere');

    expect(TestBed.inject(Router).url).toBe('/form');
  });
});

describe('app routes', () => {
  it('should guard both the create and the edit form', () => {
    const guarded = routes
      .filter((route) => route.canDeactivate?.includes(unsavedChangesGuard))
      .map((route) => route.path);

    expect(guarded).toEqual(['songs/new', 'songs/:songId/edit']);
  });
});
