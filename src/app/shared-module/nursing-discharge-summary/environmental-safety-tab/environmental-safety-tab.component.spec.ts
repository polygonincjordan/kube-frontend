import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EnvironmentalSafetyTabComponent } from './environmental-safety-tab.component';

describe('EnvironmentalSafetyTabComponent', () => {
  let component: EnvironmentalSafetyTabComponent;
  let fixture: ComponentFixture<EnvironmentalSafetyTabComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EnvironmentalSafetyTabComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EnvironmentalSafetyTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
