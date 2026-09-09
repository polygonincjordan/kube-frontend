import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SearchSelectDiagnosisCodeComponent } from './search-select-diagnosis-code.component';

describe('SearchSelectDiagnosisCodeComponent', () => {
  let component: SearchSelectDiagnosisCodeComponent;
  let fixture: ComponentFixture<SearchSelectDiagnosisCodeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SearchSelectDiagnosisCodeComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SearchSelectDiagnosisCodeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
