import { Component, inject, type OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { take } from 'rxjs';
import type { Song } from '../models/song';
import { SongService } from '../services/song.service';
import { SongStore } from "../store/song.store";

@Component({
  selector: 'app-songdetails',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './songdetails.component.html',
  styleUrl: './songdetails.component.scss',
})
export class SongdetailsComponent implements OnInit {
  readonly activatedRoute = inject(ActivatedRoute);
  readonly songService = inject(SongService);
  readonly songStore = inject(SongStore);

  song?: Song;

  ngOnInit(): void {
    this.activatedRoute.params.pipe(take(1)).subscribe(({ songId }) => {
      this.song = this.songService.getSongById(songId);
    });
  }
}
