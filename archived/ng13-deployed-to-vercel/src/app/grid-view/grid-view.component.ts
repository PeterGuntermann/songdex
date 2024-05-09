import { Component } from "@angular/core";
import { CellClickedEvent, GridOptions, GridSizeChangedEvent } from "ag-grid-community";
import { SongRepository } from "../songs/song-repository.service";
import { gridColumnDefinitions } from "./grid-column-definitions";
import { Song } from "../songs/model";
import { Router } from "@angular/router";

@Component({
    selector: "app-grid-view",
    templateUrl: "./grid-view.component.html",
    styleUrls: ["./grid-view.component.scss"],
})
export class GridViewComponent {
    gridOptions: GridOptions = {
        columnDefs: gridColumnDefinitions,
        suppressCellFocus: true,
        suppressMovableColumns: true,
        onGridSizeChanged: (event: GridSizeChangedEvent) => {
            event.api.sizeColumnsToFit();
        },
    };

    constructor(public songRepository: SongRepository, private router: Router) {}

    async onCellClicked({ data: song }: CellClickedEvent<Song>) {
        await this.router.navigateByUrl(`detail/${song?.id}`);
    }
}
