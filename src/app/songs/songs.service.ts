import { Injectable } from '@angular/core';
import { DUMMY_SONGS } from "./dummy-songs";
import { Song } from "./model";

@Injectable({
    providedIn: 'root'
})
export class SongsService {

    private _songs: Song[] = [];

    constructor() {
        this._songs = DUMMY_SONGS;
    }

    get songs() {
        return this._songs
    }

}
