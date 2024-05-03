import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OutPatientNursingComponent } from './out-patient-nursing.component';

describe('OutPatientNursingComponent', () => {
  let component: OutPatientNursingComponent;
  let fixture: ComponentFixture<OutPatientNursingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OutPatientNursingComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OutPatientNursingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
