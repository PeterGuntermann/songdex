import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SongdetailsComponent } from './songdetails.component';

describe('SongdetailsComponent', () => {
  let component: SongdetailsComponent;
  let fixture: ComponentFixture<SongdetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SongdetailsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SongdetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
