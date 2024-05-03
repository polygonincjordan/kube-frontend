import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DischargeProcessComponent } from './discharge-process.component';

describe('DischargeProcessComponent', () => {
  let component: DischargeProcessComponent;
  let fixture: ComponentFixture<DischargeProcessComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DischargeProcessComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DischargeProcessComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
