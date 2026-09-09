import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MedicationProfileEventsComponent } from './medication-profile-events.component';

describe('MedicationProfileEventsComponent', () => {
  let component: MedicationProfileEventsComponent;
  let fixture: ComponentFixture<MedicationProfileEventsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MedicationProfileEventsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MedicationProfileEventsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
