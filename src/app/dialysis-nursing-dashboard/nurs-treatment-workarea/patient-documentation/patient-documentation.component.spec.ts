import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PatientDocumentationComponent } from './patient-documentation.component';

describe('PatientDocumentationComponent', () => {
  let component: PatientDocumentationComponent;
  let fixture: ComponentFixture<PatientDocumentationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PatientDocumentationComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PatientDocumentationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
