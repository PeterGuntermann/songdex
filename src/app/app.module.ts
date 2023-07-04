import { HttpClientModule } from "@angular/common/http";
import { NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { AgGridModule } from "ag-grid-angular";
import { AppRoutingModule } from "./app-routing.module";
import { AppComponent } from "./app.component";
import { GridViewComponent } from './grid-view/grid-view.component';
import { NavbarComponent } from './navbar/navbar.component';
import { DetailViewComponent } from './detail-view/detail-view.component';

@NgModule({
    declarations: [AppComponent, GridViewComponent, NavbarComponent, DetailViewComponent],
    imports: [BrowserModule, AppRoutingModule, AgGridModule, HttpClientModule],
    providers: [],
    bootstrap: [AppComponent],
})
export class AppModule {}
