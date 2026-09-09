import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PriorToAdmissionComponent } from './prior-to-admission.component';

describe('PriorToAdmissionComponent', () => {
  let component: PriorToAdmissionComponent;
  let fixture: ComponentFixture<PriorToAdmissionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PriorToAdmissionComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PriorToAdmissionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
