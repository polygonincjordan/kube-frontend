import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TemplateDescriptionComponent } from './template-description.component';

describe('TemplateDescriptionComponent', () => {
  let component: TemplateDescriptionComponent;
  let fixture: ComponentFixture<TemplateDescriptionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TemplateDescriptionComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TemplateDescriptionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
