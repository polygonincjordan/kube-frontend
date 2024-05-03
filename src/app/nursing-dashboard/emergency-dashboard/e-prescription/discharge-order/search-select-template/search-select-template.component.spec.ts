import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SearchSelectTemplateComponent } from './search-select-template.component';

describe('SearchSelectTemplateComponent', () => {
  let component: SearchSelectTemplateComponent;
  let fixture: ComponentFixture<SearchSelectTemplateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SearchSelectTemplateComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SearchSelectTemplateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
