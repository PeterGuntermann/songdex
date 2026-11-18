import { Component } from '@angular/core';
import { type ComponentFixture, TestBed } from '@angular/core/testing';
import { MockProvider } from 'ng-mocks';
import { Observable, of, throwError } from 'rxjs';
import type { Mock } from 'vitest';
import type { Song } from '../models/song';
import { SongService } from '../services/song.service';
import { stubDialog } from '../shared/confirm-dialog/dialog.testing';
import { SONG_STATE, type SongState, SongStore } from '../store/song.store';
import { TestSongs } from '../store/song.store.testdata';
import { SongdeleteComponent } from './songdelete.component';

@Component({
  standalone: true,
  imports: [SongdeleteComponent],
  // The wrapper stands in for a clickable table row.
  template: `
    <div (click)="parentClicks = parentClicks + 1">
      <app-songdelete [song]="song" (deleted)="deleted = deleted + 1" (failed)="failure = $event" />
    </div>
  `,
})
class HostComponent {
  song: Song = TestSongs[3];
  parentClicks = 0;
  deleted = 0;
  failure: string | null = null;
}

describe('SongdeleteComponent', () => {
  let fixture: ComponentFixture<HostComponent>;
  let host: HostComponent;
  let deleteSong: Mock<(id: string) => Observable<void>>;

  beforeEach(async () => {
    stubDialog();
    deleteSong = vi.fn<(id: string) => Observable<void>>(() => of(undefined));
    await TestBed.configureTestingModule({
      imports: [HostComponent],
      providers: [
        MockProvider(SongService, { deleteSong }),
        {
          provide: SONG_STATE,
          useValue: { allSongs: [TestSongs[3]], loading: false, error: null } satisfies SongState,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(HostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  const el = (): HTMLElement => fixture.nativeElement;
  const deleteButton = () => el().querySelector<HTMLButtonElement>('button[type="button"]');
  const dialog = () => el().querySelector<HTMLDialogElement>('dialog');

  /** Clicks delete and answers the question; resolves once the component has acted on it. */
  const deleteAnswering = async (answer: 'confirm' | 'cancel') => {
    deleteButton()?.click();
    dialog()?.close(answer);
    await fixture.whenStable();
    fixture.detectChanges();
  };

  it('should name the song in the question', () => {
    expect(dialog()?.textContent).toContain(
      '“Song 3” will be removed from the catalogue. This cannot be undone.',
    );
  });

  it('should ask before deleting', () => {
    deleteButton()?.click();

    expect(dialog()?.hasAttribute('open')).toBe(true);
    expect(deleteSong).not.toHaveBeenCalled();
  });

  it('should keep the song when the question is dismissed', async () => {
    await deleteAnswering('cancel');

    expect(deleteSong).not.toHaveBeenCalled();
    expect(host.deleted).toBe(0);
  });

  it('should delete the song on confirmation and report it', async () => {
    await deleteAnswering('confirm');

    expect(deleteSong).toHaveBeenCalledWith('3');
    expect(host.deleted).toBe(1);
    expect(host.failure).toBeNull();
  });

  it('should report the store error when the backend refuses', async () => {
    const store = TestBed.inject(SongStore);
    deleteSong.mockImplementation(() => {
      store.setError('This song no longer exists.');
      return throwError(() => new Error('404'));
    });

    await deleteAnswering('confirm');

    expect(host.deleted).toBe(0);
    expect(host.failure).toBe('This song no longer exists.');
    expect(deleteButton()?.disabled).toBe(false);
  });

  it('should be disabled while the delete is in flight', async () => {
    deleteSong.mockReturnValue(new Observable<void>());

    await deleteAnswering('confirm');

    expect(deleteButton()?.disabled).toBe(true);
  });

  it('should not let clicks reach the row it sits in', async () => {
    await deleteAnswering('cancel');

    expect(host.parentClicks).toBe(0);
  });
});
