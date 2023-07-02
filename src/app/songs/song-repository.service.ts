import { Injectable, isDevMode } from "@angular/core";
import { PersistenceService } from "../persistence.service";
import { DUMMY_SONGS } from "./dummy-songs";
import { Song } from "./model";

@Injectable({
    providedIn: "root",
})
export class SongRepository {
    private readonly DATABASE_KEY = "songs";

    private _songs: Song[] = [];

    constructor(private persistence: PersistenceService) {
        if (isDevMode()) {
            this._songs = DUMMY_SONGS;
        } else {
            this.fetchSongsFromServer();
        }
    }

    getAll() {
        return this._songs;
    }

    fetchSongsFromServer() {
        this.persistence.fetchValueByKey(this.DATABASE_KEY).then(songs => {
            this._songs = songs as Song[];
            console.log("Got new songs!", this._songs);
        });
    }

    seedWithDummyData() {
        this.persistence.setKeyValue(this.DATABASE_KEY, DUMMY_SONGS);
    }
}
