import { Component } from "@angular/core";
import { SongRepository } from "../songs/song-repository.service";
import { FormControl, FormGroup } from "@angular/forms";

@Component({
    selector: "app-navbar",
    templateUrl: "./navbar.component.html",
    styleUrls: ["./navbar.component.scss"],
})
export class NavbarComponent {
    newSongForm = new FormGroup({
        titel: new FormControl(),
        artist: new FormControl(),
    });

    constructor(public songRepository: SongRepository) {}

    onSubmit() {
        console.log("Valid?", this.newSongForm.valid);
        console.log("Value", this.newSongForm.value);
    }
}
