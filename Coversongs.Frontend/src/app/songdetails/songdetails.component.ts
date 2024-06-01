import { Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';

@Component({
  selector: 'app-songdetails',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './songdetails.component.html',
  styleUrl: './songdetails.component.scss',
})
export class SongdetailsComponent {
  readonly activatedRoute = inject(ActivatedRoute);
}
