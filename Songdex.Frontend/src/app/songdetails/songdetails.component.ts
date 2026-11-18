import { Component, computed, inject, type OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { SongService } from '../services/song.service';
import { SongdeleteComponent } from '../songdelete/songdelete.component';
import { SongStore } from '../store/song.store';

@Component({
  selector: 'app-songdetails',
  standalone: true,
  imports: [RouterLink, SongdeleteComponent],
  templateUrl: './songdetails.component.html',
  styleUrl: './songdetails.component.scss',
})
export class SongdetailsComponent implements OnInit {
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly songService = inject(SongService);
  readonly songStore = inject(SongStore);

  private readonly songId = signal('');
  /** Kept here rather than read from the store, whose `error` may stem from an earlier request. */
  readonly deleteError = signal<string | null>(null);

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

  edit(songId: string): void {
    void this.router.navigate(['/songs', songId, 'edit']);
  }

  backToList(): void {
    void this.router.navigate(['/songs']);
  }
}
