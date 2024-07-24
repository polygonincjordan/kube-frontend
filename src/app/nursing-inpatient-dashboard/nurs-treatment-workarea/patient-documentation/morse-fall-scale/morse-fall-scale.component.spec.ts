import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MorseFallScaleComponent } from './morse-fall-scale.component';

describe('MorseFallScaleComponent', () => {
  let component: MorseFallScaleComponent;
  let fixture: ComponentFixture<MorseFallScaleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MorseFallScaleComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MorseFallScaleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
