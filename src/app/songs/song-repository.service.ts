import { HttpClient } from "@angular/common/http";
import { Injectable, isDevMode } from "@angular/core";
import { BehaviorSubject, firstValueFrom, Observable } from "rxjs";
import { PersistenceService } from "../persistence.service";
import { DUMMY_SONGS } from "./dummy-songs";
import { Song } from "./model";

@Injectable({
    providedIn: "root",
})
export class SongRepository {
    private readonly DATABASE_KEY = "songs";

    private _songs$ = new BehaviorSubject<Song[]>([]);

    constructor(private persistence: PersistenceService, private http: HttpClient) {
        if (isDevMode()) {
            this.http.get<Song[]>("assets/songs.json").subscribe(songs => {
                this._songs$.next(songs);
            });
        } else {
            this.fetchSongsFromServer();
        }
    }

    get allSongs$(): Observable<Song[]> {
        return this._songs$;
    }

    fetchSongsFromServer() {
        this.persistence.fetchValueByKey<Song[]>(this.DATABASE_KEY).then(songs => {
            this._songs$.next(songs ?? []);
        });
    }

    /** @obsolete This method can be removed as soon as ADD is implemented. */
    seedWithDummyData() {
        this.persistence.setKeyValue(this.DATABASE_KEY, DUMMY_SONGS);
    }

    addSong(song: Song) {
        console.log("Not yet implemented.");
    }

    async getSongById(id: string): Promise<Song | undefined> {
        const songs = await firstValueFrom(this.allSongs$);
        return songs.find(song => song.id === id);
    }

    updateSong(id: string) {
        console.log("Not yet implemented.");
    }

    deleteSong(id: string) {
        console.log("Not yet implemented.");
    }
}
