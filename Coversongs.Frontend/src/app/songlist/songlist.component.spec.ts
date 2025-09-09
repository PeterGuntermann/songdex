import { type ComponentFixture, TestBed } from '@angular/core/testing';

import { SonglistComponent } from './songlist.component';

describe('SonglistComponent', () => {
  let component: SonglistComponent;
  let fixture: ComponentFixture<SonglistComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SonglistComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SonglistComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
