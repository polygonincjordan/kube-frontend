import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProgressNotesNursingComponent } from './progress-notes-nursing.component';

describe('ProgressNotesNursingComponent', () => {
  let component: ProgressNotesNursingComponent;
  let fixture: ComponentFixture<ProgressNotesNursingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProgressNotesNursingComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProgressNotesNursingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
