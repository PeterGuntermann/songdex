import { Component } from "@angular/core";
import { GridOptions, GridSizeChangedEvent } from "ag-grid-community";
import { SongRepository } from "../songs/song-repository.service";
import { gridColumnDefinitions } from "./grid-column-definitions";

@Component({
    selector: "app-grid-view",
    templateUrl: "./grid-view.component.html",
    styleUrls: ["./grid-view.component.scss"],
})
export class GridViewComponent {
    gridOptions: GridOptions = {
        columnDefs: gridColumnDefinitions,
        onGridSizeChanged: (event: GridSizeChangedEvent) => {
            event.api.sizeColumnsToFit();
        },
    };

    constructor(public songRepository: SongRepository) {}
}
