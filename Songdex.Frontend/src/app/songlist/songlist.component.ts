import { Component, inject, type OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SongService } from '../services/song.service';
import { SongStore } from "../store/song.store";

@Component({
  selector: 'app-songlist',
  standalone: true,
  imports: [],
  templateUrl: './songlist.component.html',
  styleUrl: './songlist.component.scss',
})
export class SonglistComponent implements OnInit {
  readonly songService = inject(SongService);
  readonly songStore: SongStore = inject(SongStore);

  readonly router = inject(Router);

  ngOnInit(): void {
    this.songService.getSongs().subscribe({
      next: console.log,
      error: console.log,
    });
  }
}
