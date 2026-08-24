import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TransferAssessmentComponent } from './transfer-assessment.component';

describe('TransferAssessmentComponent', () => {
  let component: TransferAssessmentComponent;
  let fixture: ComponentFixture<TransferAssessmentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TransferAssessmentComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TransferAssessmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
