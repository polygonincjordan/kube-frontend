import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MissedMedicationsDosesComponent } from './missed-medications-doses.component';

describe('MissedMedicationsDosesComponent', () => {
  let component: MissedMedicationsDosesComponent;
  let fixture: ComponentFixture<MissedMedicationsDosesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MissedMedicationsDosesComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MissedMedicationsDosesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
