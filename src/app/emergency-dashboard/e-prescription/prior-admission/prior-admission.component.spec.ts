import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PriorAdmissionComponent } from './prior-admission.component';

describe('PriorAdmissionComponent', () => {
  let component: PriorAdmissionComponent;
  let fixture: ComponentFixture<PriorAdmissionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PriorAdmissionComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PriorAdmissionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
