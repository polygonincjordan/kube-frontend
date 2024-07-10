import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FacePainScalePopupComponent } from './face-pain-scale-popup.component';

describe('FacePainScaleComponent', () => {
  let component: FacePainScalePopupComponent;
  let fixture: ComponentFixture<FacePainScalePopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FacePainScalePopupComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FacePainScalePopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
