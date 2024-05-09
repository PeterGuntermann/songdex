import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddNewSongFormComponent } from './add-new-song-form.component';

describe('AddNewSongFormComponent', () => {
  let component: AddNewSongFormComponent;
  let fixture: ComponentFixture<AddNewSongFormComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AddNewSongFormComponent]
    });
    fixture = TestBed.createComponent(AddNewSongFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
