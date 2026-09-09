import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HospitalFloorsComponent } from './hospital-floors.component';

describe('HospitalFloorsComponent', () => {
  let component: HospitalFloorsComponent;
  let fixture: ComponentFixture<HospitalFloorsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HospitalFloorsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HospitalFloorsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
