import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditPriortoAdmissionlistComponent } from './edit-priorto-admissionlist.component';

describe('EditPriortoAdmissionlistComponent', () => {
  let component: EditPriortoAdmissionlistComponent;
  let fixture: ComponentFixture<EditPriortoAdmissionlistComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EditPriortoAdmissionlistComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditPriortoAdmissionlistComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
