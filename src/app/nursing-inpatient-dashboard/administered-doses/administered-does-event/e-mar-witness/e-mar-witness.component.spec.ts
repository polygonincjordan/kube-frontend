import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EMarWitnessComponent } from './e-mar-witness.component';

describe('EMarWitnessComponent', () => {
  let component: EMarWitnessComponent;
  let fixture: ComponentFixture<EMarWitnessComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EMarWitnessComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EMarWitnessComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
