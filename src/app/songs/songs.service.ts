import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { DUMMY_SONGS } from "./dummy-songs";
import { Song } from "./model";

namespace Spreadsheet {
    const sheetId = "1DIje1IZ6hqs8GVWLBtpiB6iesN8ceOvP5z9t63iud-c";
    const base = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?`;
    const sheetName = "mainSheet";
    const query = encodeURIComponent("Select *");
    const url = `${base}&sheet=${sheetName}&tq=${query}`;
}

@Injectable({
    providedIn: "root",
})
export class SongsService {
    private _songs: Song[] = [];

    constructor(private http: HttpClient) {
        this._songs = DUMMY_SONGS;
    }

    querySongs() {
        console.log("QUERY");
        this.http.get(this._googleSpreadsheetUrl).subscribe(x => console.log("SUCCESS:", x));
    }

    get songs() {
        return this._songs;
    }

    private get _googleSpreadsheetUrl(): string {
        const sheetId = "1DIje1IZ6hqs8GVWLBtpiB6iesN8ceOvP5z9t63iud-c";
        const base = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?`;
        const sheetName = "mainSheet";
        const query = encodeURIComponent("Select *");
        const url = `${base}&sheet=${sheetName}&tq=${query}`;

        console.log(url);
        return url;

        // const sheetUrl = "https://docs.google.com/spreadsheets/d/1DIje1IZ6hqs8GVWLBtpiB6iesN8ceOvP5z9t63iud-c/edit?usp=sharing"
        // const apiBase = "https://docs.google.com/spreadsheets/d"
        // const sheetHash = "1DIje1IZ6hqs8GVWLBtpiB6iesN8ceOvP5z9t63iud-c"
        // const httpParams = "edit?usp=sharing"
        // return `${apiBase}/${sheetHash}/${httpParams}`;
    }
}
