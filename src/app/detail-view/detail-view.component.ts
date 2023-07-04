import { Component, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { Song } from "../songs/model";
import { SongRepository } from "../songs/song-repository.service";

@Component({
    selector: "app-detail-view",
    templateUrl: "./detail-view.component.html",
    styleUrls: ["./detail-view.component.scss"],
})
export class DetailViewComponent implements OnInit {
    song?: Song;

    constructor(private route: ActivatedRoute, private songRepository: SongRepository) {}

    ngOnInit(): void {
        this.route.params.subscribe(({ songId }) => {
            this.song = this.songRepository.getSongById(songId);
            console.log(songId, this.song);
        });
    }
}
