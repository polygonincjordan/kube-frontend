import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PaediatricsAdmDocumentComponent } from './paediatrics-adm-document.component';

describe('PaediatricsAdmDocumentComponent', () => {
  let component: PaediatricsAdmDocumentComponent;
  let fixture: ComponentFixture<PaediatricsAdmDocumentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PaediatricsAdmDocumentComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PaediatricsAdmDocumentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
