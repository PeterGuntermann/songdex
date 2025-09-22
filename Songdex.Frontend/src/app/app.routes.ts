import type { Routes } from '@angular/router';
import { PlaygroundComponent } from './playground/playground.component';
import { SongdetailsComponent } from './songdetails/songdetails.component';
import { SonglistComponent } from './songlist/songlist.component';

export const routes: Routes = [
  { path: 'test', component: PlaygroundComponent },
  { path: 'songs', component: SonglistComponent },
  { path: 'songs/:songId', component: SongdetailsComponent },
  { path: '**', redirectTo: 'songs' },
];
