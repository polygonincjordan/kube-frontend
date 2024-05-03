import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ObstetricRiskComponent } from './obstetric-risk.component';

describe('ObstetricRiskComponent', () => {
  let component: ObstetricRiskComponent;
  let fixture: ComponentFixture<ObstetricRiskComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ObstetricRiskComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ObstetricRiskComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
