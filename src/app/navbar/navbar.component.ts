import { Component } from "@angular/core";
import { SongRepository } from "../songs/song-repository.service";
import { FormControl, FormGroup } from "@angular/forms";
import { SongFactory } from "../songs/song-factory";

@Component({
    selector: "app-navbar",
    templateUrl: "./navbar.component.html",
    styleUrls: ["./navbar.component.scss"],
})
export class NavbarComponent {
    newSongForm = new FormGroup({
        title: new FormControl(),
        artist: new FormControl(),
    });

    constructor(public songRepository: SongRepository) {}

    onSubmit() {
        const { title, artist } = this.newSongForm.value;
        const song = SongFactory.new(title, artist);
        this.songRepository.addSong(song);
        this.newSongForm.reset();
    }
}
