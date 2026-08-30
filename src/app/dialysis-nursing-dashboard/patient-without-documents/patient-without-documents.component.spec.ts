import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PatientWithoutDocumentsComponent } from './patient-without-documents.component';

describe('PatientWithoutDocumentsComponent', () => {
  let component: PatientWithoutDocumentsComponent;
  let fixture: ComponentFixture<PatientWithoutDocumentsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PatientWithoutDocumentsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PatientWithoutDocumentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
