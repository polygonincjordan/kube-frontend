import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsultationsOrdersListComponent } from './consultations-orders-list.component';

describe('ConsultationsOrdersListComponent', () => {
  let component: ConsultationsOrdersListComponent;
  let fixture: ComponentFixture<ConsultationsOrdersListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ConsultationsOrdersListComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConsultationsOrdersListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
