import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DyingPatientComponent } from './dying-patient.component';

describe('DyingPatientComponent', () => {
  let component: DyingPatientComponent;
  let fixture: ComponentFixture<DyingPatientComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DyingPatientComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DyingPatientComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
