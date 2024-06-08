import { Component, type OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { SongService } from '../services/song.service';

@Component({
  selector: 'app-songlist',
  standalone: true,
  imports: [],
  templateUrl: './songlist.component.html',
  styleUrl: './songlist.component.scss',
})
export class SonglistComponent implements OnInit {
  readonly songService = inject(SongService);
  readonly router = inject(Router);

  ngOnInit(): void {
    this.songService.getSongs().subscribe({
      next: console.log,
      error: console.log,
    });
  }
}
