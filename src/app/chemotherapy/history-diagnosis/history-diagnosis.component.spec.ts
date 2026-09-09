import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HistoryDiagnosisComponent } from './history-diagnosis.component';

describe('HistoryDiagnosisComponent', () => {
  let component: HistoryDiagnosisComponent;
  let fixture: ComponentFixture<HistoryDiagnosisComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HistoryDiagnosisComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HistoryDiagnosisComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
