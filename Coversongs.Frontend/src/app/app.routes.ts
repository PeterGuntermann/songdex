import type { Routes } from '@angular/router';
import { PlaygroundComponent } from './playground/playground.component';

export const routes: Routes = [
  { path: 'test', component: PlaygroundComponent },
  { path: '**', redirectTo: 'test' },
];
