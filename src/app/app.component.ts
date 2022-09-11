import { Component } from '@angular/core';
import { ColDef } from "ag-grid-community";
import { DUMMY_SONGS } from "./songs/dummy-songs";
import { Song } from "./songs/model";

const COL_DEFS = [
    {
        field: 'title',
        minWidth: 100
    },
    {
        field: 'interpret',
        minWidth: 100
    },
    {
        field: 'link',
        minWidth: 200
    }
];

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent {
    columnDefs: ColDef[] = COL_DEFS;
    rowData: Song[] = DUMMY_SONGS;
}
