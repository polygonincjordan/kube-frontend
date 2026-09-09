import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ImportDiagnosisComponent } from './import-diagnosis.component';

describe('ImportDiagnosisComponent', () => {
  let component: ImportDiagnosisComponent;
  let fixture: ComponentFixture<ImportDiagnosisComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ImportDiagnosisComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ImportDiagnosisComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
