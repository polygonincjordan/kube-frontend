import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BradenScaleComponent } from './braden-scale.component';

describe('BradenScaleComponent', () => {
  let component: BradenScaleComponent;
  let fixture: ComponentFixture<BradenScaleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BradenScaleComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BradenScaleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
