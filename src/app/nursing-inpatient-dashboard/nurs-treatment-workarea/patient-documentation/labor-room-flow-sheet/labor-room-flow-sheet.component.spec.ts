import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LaborRoomFlowSheetComponent } from './labor-room-flow-sheet.component';

describe('LaborRoomFlowSheetComponent', () => {
  let component: LaborRoomFlowSheetComponent;
  let fixture: ComponentFixture<LaborRoomFlowSheetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LaborRoomFlowSheetComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LaborRoomFlowSheetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
