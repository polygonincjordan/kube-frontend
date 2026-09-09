import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdministrationTemplateDetailPopupComponent } from './administration-template-detail-popup.component';

describe('AdministrationTemplateDetailPopupComponent', () => {
  let component: AdministrationTemplateDetailPopupComponent;
  let fixture: ComponentFixture<AdministrationTemplateDetailPopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AdministrationTemplateDetailPopupComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdministrationTemplateDetailPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
