import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { SongService } from '../services/song.service';

@Component({
  selector: 'app-songlist',
  standalone: true,
  imports: [],
  templateUrl: './songlist.component.html',
  styleUrl: './songlist.component.scss',
})
export class SonglistComponent {
  readonly songService = inject(SongService);
  readonly router = inject(Router);
}
