import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChemoDischargeComponent } from './chemo-discharge.component';

describe('ChemoDischargeComponent', () => {
  let component: ChemoDischargeComponent;
  let fixture: ComponentFixture<ChemoDischargeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ChemoDischargeComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChemoDischargeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
