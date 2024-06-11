import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PainAssessmentNurEmrComponent } from './pain-assessment-nur-emr.component';

describe('PainAssessmentNurEmrComponent', () => {
  let component: PainAssessmentNurEmrComponent;
  let fixture: ComponentFixture<PainAssessmentNurEmrComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PainAssessmentNurEmrComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PainAssessmentNurEmrComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
