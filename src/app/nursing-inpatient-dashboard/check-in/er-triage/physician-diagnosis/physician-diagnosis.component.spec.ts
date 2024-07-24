import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PhysicianDiagnosisComponent } from './physician-diagnosis.component';

describe('PhysicianDiagnosisComponent', () => {
  let component: PhysicianDiagnosisComponent;
  let fixture: ComponentFixture<PhysicianDiagnosisComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PhysicianDiagnosisComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PhysicianDiagnosisComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
