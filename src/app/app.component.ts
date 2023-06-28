import { Component, OnInit } from "@angular/core";
import { ColDef, GridOptions, GridSizeChangedEvent } from "ag-grid-community";
import { PersistenceService } from "./persistence.service";
import { DUMMY_SONGS } from "./songs/dummy-songs";
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
    gridOptions: GridOptions = {
        columnDefs: COL_DEFS,
        rowData: DUMMY_SONGS,
        onGridSizeChanged: (event: GridSizeChangedEvent) => {
            event.api.sizeColumnsToFit();
        },
    };

    constructor(private songRepository: SongRepository, private persistence: PersistenceService) {}

    ngOnInit() {
        this.songRepository.fetchSongsFromServer();
        this.songRepository.getAll();
        this.songRepository.seedWithDummyData();
    }
}
