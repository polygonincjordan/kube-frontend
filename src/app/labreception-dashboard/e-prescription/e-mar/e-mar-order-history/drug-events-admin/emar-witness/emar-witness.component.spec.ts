import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmarWitnessComponent } from './emar-witness.component';

describe('EmarWitnessComponent', () => {
  let component: EmarWitnessComponent;
  let fixture: ComponentFixture<EmarWitnessComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EmarWitnessComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmarWitnessComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
