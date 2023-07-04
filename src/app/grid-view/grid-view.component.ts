import { Component, OnDestroy, OnInit } from "@angular/core";
import { Song } from "../songs/model";
import { Subject, takeUntil } from "rxjs";
import { GridOptions, GridSizeChangedEvent } from "ag-grid-community";
import { SongRepository } from "../songs/song-repository.service";
import { gridColumnDefinitions } from "./grid-column-definitions";

@Component({
    selector: "app-grid-view",
    templateUrl: "./grid-view.component.html",
    styleUrls: ["./grid-view.component.scss"],
})
export class GridViewComponent implements OnInit, OnDestroy {
    songs: Song[] = [];
    onDestroy$ = new Subject();

    gridOptions: GridOptions = {
        columnDefs: gridColumnDefinitions,
        onGridSizeChanged: (event: GridSizeChangedEvent) => {
            event.api.sizeColumnsToFit();
        },
    };

    constructor(public songRepository: SongRepository) {}

    ngOnInit() {
        this.songRepository.allSongs$.pipe(takeUntil(this.onDestroy$)).subscribe(songs => {
            this.songs = songs;
        });
    }

    ngOnDestroy(): void {
        this.onDestroy$.next(1);
    }
}
