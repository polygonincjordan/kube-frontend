import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NursingDischargeSummaryComponent } from './nursing-discharge-summary.component';

describe('NursingDischargeSummaryComponent', () => {
  let component: NursingDischargeSummaryComponent;
  let fixture: ComponentFixture<NursingDischargeSummaryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NursingDischargeSummaryComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NursingDischargeSummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
