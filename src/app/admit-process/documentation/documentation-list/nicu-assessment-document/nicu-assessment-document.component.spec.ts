import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NicuAssessmentDocumentComponent } from './nicu-assessment-document.component';

describe('NicuAssessmentDocumentComponent', () => {
  let component: NicuAssessmentDocumentComponent;
  let fixture: ComponentFixture<NicuAssessmentDocumentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NicuAssessmentDocumentComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NicuAssessmentDocumentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
