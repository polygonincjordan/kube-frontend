import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdministrationTemplatePopupComponent } from './administration-template-popup.component';

describe('AdministrationTemplatePopupComponent', () => {
  let component: AdministrationTemplatePopupComponent;
  let fixture: ComponentFixture<AdministrationTemplatePopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AdministrationTemplatePopupComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdministrationTemplatePopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
