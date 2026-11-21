import type { Routes } from '@angular/router';
import { unsavedChangesGuard } from './shared/unsaved-changes.guard';

export const routes: Routes = [
  {
    path: 'test',
    loadComponent: () =>
      import('./playground/playground.component').then((m) => m.PlaygroundComponent),
  },
  {
    path: 'songs',
    loadComponent: () => import('./songlist/songlist.component').then((m) => m.SonglistComponent),
  },
  {
    // Must stay above `songs/:songId`, which would otherwise swallow "new".
    path: 'songs/new',
    loadComponent: () => import('./songform/songform.component').then((m) => m.SongformComponent),
    canDeactivate: [unsavedChangesGuard],
  },
  {
    path: 'songs/:songId',
    loadComponent: () =>
      import('./songdetails/songdetails.component').then((m) => m.SongdetailsComponent),
  },
  {
    // The same form as `songs/new`; the `songId` parameter switches it into edit mode.
    path: 'songs/:songId/edit',
    loadComponent: () => import('./songform/songform.component').then((m) => m.SongformComponent),
    canDeactivate: [unsavedChangesGuard],
  },
  {
    path: 'tags',
    loadComponent: () => import('./taglist/taglist.component').then((m) => m.TaglistComponent),
  },
  { path: '**', redirectTo: 'songs' },
];
