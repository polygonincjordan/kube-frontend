import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DiagnosisTableComponent } from './diagnosis-table.component';

describe('DiagnosisTableComponent', () => {
  let component: DiagnosisTableComponent;
  let fixture: ComponentFixture<DiagnosisTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DiagnosisTableComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DiagnosisTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
