import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TemplateDetailPopupComponent } from './template-detail-popup.component';

describe('TemplateDetailPopupComponent', () => {
  let component: TemplateDetailPopupComponent;
  let fixture: ComponentFixture<TemplateDetailPopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TemplateDetailPopupComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TemplateDetailPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
