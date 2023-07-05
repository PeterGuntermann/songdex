import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { Song } from "../songs/model";
import { SongRepository } from "../songs/song-repository.service";

@Component({
    selector: "app-detail-view",
    templateUrl: "./detail-view.component.html",
    styleUrls: ["./detail-view.component.scss"],
})
export class DetailViewComponent implements OnInit {
    song?: Song;

    constructor(private route: ActivatedRoute, private router: Router, private songRepository: SongRepository) {}

    ngOnInit(): void {
        this.route.params.subscribe(async ({ songId }) => {
            this.song = await this.songRepository.getSongById(songId);
        });
    }

    async onDeleteClick(songId: string) {
        // TODO add confirmation dialog
        await this.songRepository.deleteSong(songId);
        await this.router.navigateByUrl("/");
    }
}
