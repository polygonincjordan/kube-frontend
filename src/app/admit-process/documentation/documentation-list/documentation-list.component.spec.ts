import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DocumentationListComponent } from './documentation-list.component';

describe('DocumentationListComponent', () => {
  let component: DocumentationListComponent;
  let fixture: ComponentFixture<DocumentationListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DocumentationListComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DocumentationListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
