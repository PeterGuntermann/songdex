import { Component } from "@angular/core";
import { ActivatedRoute } from "@angular/router";

@Component({
    selector: "app-detail-view",
    templateUrl: "./detail-view.component.html",
    styleUrls: ["./detail-view.component.scss"],
})
export class DetailViewComponent {
    constructor(private route: ActivatedRoute) {
        this.route.params.subscribe(console.log);
    }
}
