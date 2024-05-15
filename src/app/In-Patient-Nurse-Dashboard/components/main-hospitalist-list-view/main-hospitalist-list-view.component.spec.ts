import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MainHospitalistListViewComponent } from './main-hospitalist-list-view.component';

describe('MainHospitalistListViewComponent', () => {
  let component: MainHospitalistListViewComponent;
  let fixture: ComponentFixture<MainHospitalistListViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MainHospitalistListViewComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MainHospitalistListViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
