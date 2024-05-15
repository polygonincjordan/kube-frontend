import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MainHospitalistBedViewComponent } from './main-hospitalist-bed-view.component';

describe('MainHospitalistBedViewComponent', () => {
  let component: MainHospitalistBedViewComponent;
  let fixture: ComponentFixture<MainHospitalistBedViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MainHospitalistBedViewComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MainHospitalistBedViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
