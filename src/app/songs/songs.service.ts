import { Injectable } from "@angular/core";
import { PersistenceService } from "../persistence.service";
import { DUMMY_SONGS } from "./dummy-songs";
import { Song } from "./model";

@Injectable({
    providedIn: "root",
})
export class SongsService {
    private _songs: Song[] = [];

    constructor(private persistence: PersistenceService) {
        this._songs = DUMMY_SONGS;
    }

    querySongs() {}

    get songs() {
        return this._songs;
    }
}
