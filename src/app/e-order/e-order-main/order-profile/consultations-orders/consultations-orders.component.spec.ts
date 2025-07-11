import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsultationsOrdersComponent } from './consultations-orders.component';

describe('ConsultationsOrdersComponent', () => {
  let component: ConsultationsOrdersComponent;
  let fixture: ComponentFixture<ConsultationsOrdersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ConsultationsOrdersComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConsultationsOrdersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
