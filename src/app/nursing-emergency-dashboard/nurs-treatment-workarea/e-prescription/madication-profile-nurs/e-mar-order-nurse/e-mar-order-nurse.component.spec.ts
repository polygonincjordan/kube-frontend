import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EMarOrderNurseComponent } from './e-mar-order-nurse.component';

describe('EMarOrderNurseComponent', () => {
  let component: EMarOrderNurseComponent;
  let fixture: ComponentFixture<EMarOrderNurseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EMarOrderNurseComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EMarOrderNurseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
