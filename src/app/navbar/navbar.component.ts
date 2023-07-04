import { Component } from "@angular/core";
import { SongRepository } from "../songs/song-repository.service";

@Component({
    selector: "app-navbar",
    templateUrl: "./navbar.component.html",
    styleUrls: ["./navbar.component.scss"],
})
export class NavbarComponent {
    constructor(public songRepository: SongRepository) {}
}
