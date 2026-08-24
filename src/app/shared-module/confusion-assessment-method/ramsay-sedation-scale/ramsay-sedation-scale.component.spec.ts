import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RamsaySedationScaleComponent } from './ramsay-sedation-scale.component';

describe('RamsaySedationScaleComponent', () => {
  let component: RamsaySedationScaleComponent;
  let fixture: ComponentFixture<RamsaySedationScaleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RamsaySedationScaleComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RamsaySedationScaleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
