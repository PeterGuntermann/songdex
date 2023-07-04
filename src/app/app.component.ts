import { Component, OnDestroy, OnInit } from "@angular/core";
import { ColDef, GridOptions, GridSizeChangedEvent } from "ag-grid-community";
import { Subject, takeUntil } from "rxjs";
import { Song } from "./songs/model";
import { SongRepository } from "./songs/song-repository.service";

@Component({
    selector: "app-root",
    templateUrl: "./app.component.html",
    styleUrls: ["./app.component.scss"],
})
export class AppComponent {
    constructor(public songRepository: SongRepository) {}
}
