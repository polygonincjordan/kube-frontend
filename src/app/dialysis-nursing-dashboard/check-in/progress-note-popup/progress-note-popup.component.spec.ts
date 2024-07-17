import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProgressNotePopupComponent } from './progress-note-popup.component';

describe('ProgressNotePopupComponent', () => {
  let component: ProgressNotePopupComponent;
  let fixture: ComponentFixture<ProgressNotePopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProgressNotePopupComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProgressNotePopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
