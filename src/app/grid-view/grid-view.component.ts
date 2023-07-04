import { Component } from "@angular/core";
import { CellClickedEvent, GridOptions, GridSizeChangedEvent } from "ag-grid-community";
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
        suppressCellFocus: true,
        onGridSizeChanged: (event: GridSizeChangedEvent) => {
            event.api.sizeColumnsToFit();
        },
    };

    constructor(public songRepository: SongRepository) {}

    onCellClicked($event: CellClickedEvent<any>) {
        console.log($event);
    }
}
