import type { Routes } from '@angular/router';

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
  },
  {
    path: 'songs/:songId',
    loadComponent: () =>
      import('./songdetails/songdetails.component').then((m) => m.SongdetailsComponent),
  },
  { path: '**', redirectTo: 'songs' },
];
