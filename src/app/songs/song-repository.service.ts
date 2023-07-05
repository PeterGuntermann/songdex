import { HttpClient } from "@angular/common/http";
import { Injectable, isDevMode } from "@angular/core";
import { BehaviorSubject, filter, firstValueFrom, Observable } from "rxjs";
import { PersistenceService } from "../persistence.service";
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
        return this._songs$.pipe(filter(songs => songs.length > 0));
    }

    fetchSongsFromServer() {
        this.persistence.fetchValueByKey<Song[]>(this.DATABASE_KEY).then(songs => {
            this._songs$.next(songs ?? []);
        });
    }

    async addSong(newSong: Song) {
        const allSongs = await firstValueFrom(this.allSongs$);

        const alreadyExists = allSongs.find(song => song.title === newSong.title && song.artist === newSong.artist);
        if (alreadyExists) {
            console.warn("There already exists a song with that title and artist.");
            return;
        }

        this.updateAllSongs([...allSongs, newSong]);
    }

    async getSongById(id: string) {
        const songs = await firstValueFrom(this.allSongs$);
        return songs.find(song => song.id === id);
    }

    updateSong(id: string) {
        console.log("Not yet implemented.");
    }

    async deleteSong(id: string) {
        const songs = await firstValueFrom(this.allSongs$);
        const songsWithoutDeleted = songs.filter(song => song.id !== id);

        if (!songs.find(song => song.id === id)) {
            console.warn("Song does not exist and thus cannot be deleted!");
            return;
        }

        this.updateAllSongs(songsWithoutDeleted);
    }

    private updateAllSongs(newSongs: Song[]) {
        this._songs$.next(newSongs);

        if (isDevMode()) {
            console.log("Did not write to database because you are in dev mode.");
            return;
        }

        this.persistence.setKeyValue(this.DATABASE_KEY, newSongs);
    }
}
