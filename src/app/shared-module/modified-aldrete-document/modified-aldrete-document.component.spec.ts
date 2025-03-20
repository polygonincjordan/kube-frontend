import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModifiedAldreteDocumentComponent } from './modified-aldrete-document.component';

describe('ModifiedAldreteDocumentComponent', () => {
  let component: ModifiedAldreteDocumentComponent;
  let fixture: ComponentFixture<ModifiedAldreteDocumentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ModifiedAldreteDocumentComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModifiedAldreteDocumentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
