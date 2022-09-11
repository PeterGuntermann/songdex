import { Component } from '@angular/core';
import { ColDef, GridOptions, GridSizeChangedEvent } from "ag-grid-community";
import { DUMMY_SONGS } from "./songs/dummy-songs";

const COL_DEFS: ColDef[] = [
    {
        field: 'title',
        minWidth: 100,
    },
    {
        field: 'interpret',
        minWidth: 100,
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
    gridOptions: GridOptions = {
        columnDefs: COL_DEFS,
        rowData: DUMMY_SONGS,
        onGridSizeChanged: (event: GridSizeChangedEvent) => {
            event.api.sizeColumnsToFit();
        },
    }
}
