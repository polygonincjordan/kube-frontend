import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NursingCarePlansComponent } from './nursing-care-plans.component';

describe('NursingCarePlansComponent', () => {
  let component: NursingCarePlansComponent;
  let fixture: ComponentFixture<NursingCarePlansComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NursingCarePlansComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NursingCarePlansComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
