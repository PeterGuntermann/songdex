import { Component, OnInit } from "@angular/core";
import { ColDef, GridOptions, GridSizeChangedEvent } from "ag-grid-community";
import { environment } from "../environments/environment";
import { DUMMY_SONGS } from "./songs/dummy-songs";
import { SongsService } from "./songs/songs.service";

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

    constructor(private songsService: SongsService) {}

    ngOnInit() {
        this.songsService.querySongs();
        console.log(environment.env);
    }
}
