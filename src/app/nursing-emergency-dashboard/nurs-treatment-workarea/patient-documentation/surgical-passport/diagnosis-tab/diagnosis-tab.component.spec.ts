import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DiagnosisTabComponent } from './diagnosis-tab.component';

describe('DiagnosisTabComponent', () => {
  let component: DiagnosisTabComponent;
  let fixture: ComponentFixture<DiagnosisTabComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DiagnosisTabComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DiagnosisTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
