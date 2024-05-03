import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PrnConditionPopupComponent } from './prn-condition-popup.component';

describe('PrnConditionPopupComponent', () => {
  let component: PrnConditionPopupComponent;
  let fixture: ComponentFixture<PrnConditionPopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PrnConditionPopupComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PrnConditionPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
