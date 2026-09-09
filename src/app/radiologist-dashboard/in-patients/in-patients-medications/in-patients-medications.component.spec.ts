import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InPatientsMedicationsComponent } from './in-patients-medications.component';

describe('InPatientsMedicationsComponent', () => {
  let component: InPatientsMedicationsComponent;
  let fixture: ComponentFixture<InPatientsMedicationsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InPatientsMedicationsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InPatientsMedicationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
