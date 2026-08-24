import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DiagnosisHistoryPopupComponent } from './diagnosis-history-popup.component';

describe('DiagnosisHistoryPopupComponent', () => {
  let component: DiagnosisHistoryPopupComponent;
  let fixture: ComponentFixture<DiagnosisHistoryPopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DiagnosisHistoryPopupComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DiagnosisHistoryPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
