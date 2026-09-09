import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PriotoAdmissionlistNursComponent } from './prioto-admissionlist-nurs.component';

describe('PriotoAdmissionlistNursComponent', () => {
  let component: PriotoAdmissionlistNursComponent;
  let fixture: ComponentFixture<PriotoAdmissionlistNursComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PriotoAdmissionlistNursComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PriotoAdmissionlistNursComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
