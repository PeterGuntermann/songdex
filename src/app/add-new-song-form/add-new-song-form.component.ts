import { Component } from "@angular/core";
import { SongFactory } from "../songs/song-factory";
import { FormControl, FormGroup } from "@angular/forms";
import { SongRepository } from "../songs/song-repository.service";

@Component({
    selector: "app-add-new-song-form",
    templateUrl: "./add-new-song-form.component.html",
    styleUrls: ["./add-new-song-form.component.scss"],
})
export class AddNewSongFormComponent {
    newSongForm = new FormGroup({
        title: new FormControl(),
        artist: new FormControl(),
    });

    constructor(public songRepository: SongRepository) {}

    onSubmit() {
        const { title, artist } = this.newSongForm.value;
        const song = SongFactory.new(title, artist);
        this.newSongForm.reset();
        this.songRepository.addSong(song);
    }
}
