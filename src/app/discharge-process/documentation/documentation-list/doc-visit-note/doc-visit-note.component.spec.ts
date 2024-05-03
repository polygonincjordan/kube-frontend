import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DocVisitNoteComponent } from './doc-visit-note.component';

describe('DocVisitNoteComponent', () => {
  let component: DocVisitNoteComponent;
  let fixture: ComponentFixture<DocVisitNoteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DocVisitNoteComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DocVisitNoteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
