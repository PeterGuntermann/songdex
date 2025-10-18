import { type ComponentFixture, TestBed } from '@angular/core/testing';
import { MockProvider } from "ng-mocks";
import { of } from "rxjs";
import { SongService } from "../services/song.service";

import { SonglistComponent } from './songlist.component';

describe('SonglistComponent', () => {
  let component: SonglistComponent;
  let fixture: ComponentFixture<SonglistComponent>;
  let songService: SongService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SonglistComponent],
      providers: [MockProvider(SongService)],
    }).compileComponents();

    songService = TestBed.inject(SongService);
    songService.getSongs = jest.fn().mockReturnValue(of([]));
    fixture = TestBed.createComponent(SonglistComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
