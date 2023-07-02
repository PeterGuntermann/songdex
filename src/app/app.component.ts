import { Component, OnDestroy, OnInit } from "@angular/core";
import { ColDef, GridOptions, GridSizeChangedEvent } from "ag-grid-community";
import { Subject, takeUntil } from "rxjs";
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
export class AppComponent implements OnInit, OnDestroy {
    songs: Song[] = [];
    onDestroy$ = new Subject();

    gridOptions: GridOptions = {
        columnDefs: COL_DEFS,
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
