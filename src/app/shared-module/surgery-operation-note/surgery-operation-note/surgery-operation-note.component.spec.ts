import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SurgeryOperationNoteComponent } from './surgery-operation-note.component';

describe('SurgeryOperationNoteComponent', () => {
  let component: SurgeryOperationNoteComponent;
  let fixture: ComponentFixture<SurgeryOperationNoteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SurgeryOperationNoteComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SurgeryOperationNoteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
