import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MissedMedicationEventsComponent } from './missed-medication-events.component';

describe('MissedMedicationEventsComponent', () => {
  let component: MissedMedicationEventsComponent;
  let fixture: ComponentFixture<MissedMedicationEventsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MissedMedicationEventsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MissedMedicationEventsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
