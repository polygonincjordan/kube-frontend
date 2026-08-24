import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IcuHoursFlowsheetComponent } from './icu-hours-flowsheet.component';

describe('IcuHoursFlowsheetComponent', () => {
  let component: IcuHoursFlowsheetComponent;
  let fixture: ComponentFixture<IcuHoursFlowsheetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ IcuHoursFlowsheetComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IcuHoursFlowsheetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
