import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GlosGowCommaScaleComponent } from './glos-gow-comma-scale-popup.component';

describe('GlosGowCommaScaleComponent', () => {
  let component: GlosGowCommaScaleComponent;
  let fixture: ComponentFixture<GlosGowCommaScaleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GlosGowCommaScaleComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GlosGowCommaScaleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
