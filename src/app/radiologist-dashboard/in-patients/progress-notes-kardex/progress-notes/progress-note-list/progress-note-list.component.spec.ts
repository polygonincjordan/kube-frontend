import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProgressNoteListComponent } from './progress-note-list.component';

describe('ProgressNoteListComponent', () => {
  let component: ProgressNoteListComponent;
  let fixture: ComponentFixture<ProgressNoteListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProgressNoteListComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProgressNoteListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
