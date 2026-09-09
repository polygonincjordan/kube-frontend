import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PsychologicalEconomicComponent } from './psychological-economic.component';

describe('PsychologicalEconomicComponent', () => {
  let component: PsychologicalEconomicComponent;
  let fixture: ComponentFixture<PsychologicalEconomicComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PsychologicalEconomicComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PsychologicalEconomicComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
