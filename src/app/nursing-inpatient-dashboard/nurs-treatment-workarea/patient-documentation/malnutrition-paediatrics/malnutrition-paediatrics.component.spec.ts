import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MalnutritionPaediatricsComponent } from './malnutrition-paediatrics.component';

describe('MalnutritionPaediatricsComponent', () => {
  let component: MalnutritionPaediatricsComponent;
  let fixture: ComponentFixture<MalnutritionPaediatricsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MalnutritionPaediatricsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MalnutritionPaediatricsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
