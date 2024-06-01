import type { Routes } from '@angular/router';
import { PlaygroundComponent } from './playground/playground.component';
import { SonglistComponent } from './songlist/songlist.component';

export const routes: Routes = [
  { path: 'test', component: PlaygroundComponent },
  { path: 'songlist', component: SonglistComponent },
  { path: '**', redirectTo: 'songlist' },
];
