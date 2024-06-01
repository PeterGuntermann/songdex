import { Component, inject } from '@angular/core';
import { SonglistService } from './songlist.service';

@Component({
  selector: 'app-songlist',
  standalone: true,
  imports: [],
  templateUrl: './songlist.component.html',
  styleUrl: './songlist.component.scss',
})
export class SonglistComponent {
  readonly songlist = inject(SonglistService);
}
