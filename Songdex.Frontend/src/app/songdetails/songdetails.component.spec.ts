import { type ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from "@angular/router";
import { MockProvider } from "ng-mocks";
import { NEVER } from "rxjs";
import { SongService } from "../services/song.service";

import { SongdetailsComponent } from './songdetails.component';

describe('SongdetailsComponent', () => {
  let component: SongdetailsComponent;
  let fixture: ComponentFixture<SongdetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SongdetailsComponent],
      providers: [MockProvider(SongService), MockProvider(ActivatedRoute, { params: NEVER })],
    }).compileComponents();

    fixture = TestBed.createComponent(SongdetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
