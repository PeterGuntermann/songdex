import { HttpClient } from "@angular/common/http";
import { Component, ViewChild } from '@angular/core';
import { AgGridAngular } from "ag-grid-angular";
import { CellClickedEvent, ColDef, GridReadyEvent } from "ag-grid-community";
import { Observable } from "rxjs";

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent {

    public columnDefs: ColDef[] = [
        {field: 'make'},
        {field: 'model'},
        {field: 'price'}
    ];

    public defaultColDef: ColDef = {
        sortable: true,
        filter: true,
    };

    public rowData$!: Observable<any[]>;

    @ViewChild(AgGridAngular) agGrid!: AgGridAngular;

    constructor(private http: HttpClient) {
    }

    // Example load data from sever
    onGridReady(params: GridReadyEvent) {
        this.rowData$ = this.http
            .get<any[]>('https://www.ag-grid.com/example-assets/row-data.json');
    }

    // Example of consuming Grid Event
    onCellClicked(e: CellClickedEvent): void {
        console.log('cellClicked', e);
    }

    // Example using Grid's API
    clearSelection(): void {
        this.agGrid.api.deselectAll();
    }

}
