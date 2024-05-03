import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ToAdmissionComponent } from './to-admission.component';

describe('ToAdmissionComponent', () => {
  let component: ToAdmissionComponent;
  let fixture: ComponentFixture<ToAdmissionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ToAdmissionComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ToAdmissionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
