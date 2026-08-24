import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GlasgowComaScaleComponent } from './glasgow-coma-scale.component';

describe('GlasgowComaScaleComponent', () => {
  let component: GlasgowComaScaleComponent;
  let fixture: ComponentFixture<GlasgowComaScaleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GlasgowComaScaleComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GlasgowComaScaleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
