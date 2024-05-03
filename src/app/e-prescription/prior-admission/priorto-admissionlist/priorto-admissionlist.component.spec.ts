import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PriortoAdmissionlistComponent } from './priorto-admissionlist.component';

describe('PriortoAdmissionlistComponent', () => {
  let component: PriortoAdmissionlistComponent;
  let fixture: ComponentFixture<PriortoAdmissionlistComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PriortoAdmissionlistComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PriortoAdmissionlistComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
