import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PaediatricPhysicianAssessmentComponent } from './paediatric-physician-assessment.component';

describe('PaediatricPhysicianAssessmentComponent', () => {
  let component: PaediatricPhysicianAssessmentComponent;
  let fixture: ComponentFixture<PaediatricPhysicianAssessmentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PaediatricPhysicianAssessmentComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PaediatricPhysicianAssessmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
