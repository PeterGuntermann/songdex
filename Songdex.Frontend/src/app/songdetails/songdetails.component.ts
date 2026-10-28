import { Component, computed, inject, type OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { SongService } from '../services/song.service';
import { SongStore } from '../store/song.store';

@Component({
  selector: 'app-songdetails',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './songdetails.component.html',
  styleUrl: './songdetails.component.scss',
})
export class SongdetailsComponent implements OnInit {
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly songService = inject(SongService);
  readonly songStore = inject(SongStore);

  private readonly songId = signal('');

  /** Reads through the store, so the song appears as soon as the fetch below lands. */
  readonly song = computed(() => this.songStore.getSongById(this.songId()));

  ngOnInit(): void {
    const songId = this.activatedRoute.snapshot.paramMap.get('songId') ?? '';
    this.songId.set(songId);

    // Deep link: nothing has filled the catalogue yet.
    if (!this.songStore.getSongById(songId)) {
      this.songService.fetchSong(songId);
    }
  }
}
