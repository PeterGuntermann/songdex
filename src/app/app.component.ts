import { Component, OnInit } from "@angular/core";
import { ColDef, GridOptions, GridSizeChangedEvent } from "ag-grid-community";
import { Song } from "./songs/model";
import { SongRepository } from "./songs/song-repository.service";

const COL_DEFS: ColDef[] = [
    {
        field: "title",
        minWidth: 100,
    },
    {
        field: "interpret",
        minWidth: 100,
    },
    {
        field: "link",
        minWidth: 200,
    },
];

@Component({
    selector: "app-root",
    templateUrl: "./app.component.html",
    styleUrls: ["./app.component.scss"],
})
export class AppComponent implements OnInit {
    songs: Song[] = [];

    gridOptions: GridOptions = {
        columnDefs: COL_DEFS,
        onGridSizeChanged: (event: GridSizeChangedEvent) => {
            event.api.sizeColumnsToFit();
        },
    };

    constructor(public songRepository: SongRepository) {}

    ngOnInit() {
        this.songs = this.songRepository.getAll();
    }
}
