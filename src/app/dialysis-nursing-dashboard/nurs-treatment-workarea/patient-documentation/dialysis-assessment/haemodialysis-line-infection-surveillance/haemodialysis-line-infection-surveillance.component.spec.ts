import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HaemodialysisLineInfectionSurveillanceComponent } from './haemodialysis-line-infection-surveillance.component';

describe('HaemodialysisLineInfectionSurveillanceComponent', () => {
  let component: HaemodialysisLineInfectionSurveillanceComponent;
  let fixture: ComponentFixture<HaemodialysisLineInfectionSurveillanceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HaemodialysisLineInfectionSurveillanceComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HaemodialysisLineInfectionSurveillanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
