import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NicuNursingFlowSheetComponent } from './nicu-nursing-flow-sheet.component';

describe('NicuNursingFlowSheetComponent', () => {
  let component: NicuNursingFlowSheetComponent;
  let fixture: ComponentFixture<NicuNursingFlowSheetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NicuNursingFlowSheetComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NicuNursingFlowSheetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
