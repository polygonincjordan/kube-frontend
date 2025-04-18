import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GastrointestinalPhysicalTabComponent } from './gastrointestinal-physical-tab.component';

describe('GastrointestinalPhysicalTabComponent', () => {
  let component: GastrointestinalPhysicalTabComponent;
  let fixture: ComponentFixture<GastrointestinalPhysicalTabComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GastrointestinalPhysicalTabComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GastrointestinalPhysicalTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
