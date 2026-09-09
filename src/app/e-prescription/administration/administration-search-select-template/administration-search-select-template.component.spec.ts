import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdministrationSearchSelectTemplateComponent } from './administration-search-select-template.component';

describe('AdministrationSearchSelectTemplateComponent', () => {
  let component: AdministrationSearchSelectTemplateComponent;
  let fixture: ComponentFixture<AdministrationSearchSelectTemplateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AdministrationSearchSelectTemplateComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdministrationSearchSelectTemplateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
