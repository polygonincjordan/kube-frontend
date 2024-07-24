import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PriorAdmissionOptionsNurseComponent } from './prior-admission-options-nurse.component';

describe('PriorAdmissionOptionsNurseComponent', () => {
  let component: PriorAdmissionOptionsNurseComponent;
  let fixture: ComponentFixture<PriorAdmissionOptionsNurseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PriorAdmissionOptionsNurseComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PriorAdmissionOptionsNurseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
