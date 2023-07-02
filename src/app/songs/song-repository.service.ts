import { HttpClient } from "@angular/common/http";
import { Injectable, isDevMode } from "@angular/core";
import { BehaviorSubject, Observable } from "rxjs";
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

    getAll(): Observable<Song[]> {
        return this._songs$;
    }

    fetchSongsFromServer() {
        this.persistence.fetchValueByKey<Song[]>(this.DATABASE_KEY).then(songs => {
            this._songs$.next(songs ?? []);
        });
    }

    seedWithDummyData() {
        this.persistence.setKeyValue(this.DATABASE_KEY, DUMMY_SONGS);
    }
}
