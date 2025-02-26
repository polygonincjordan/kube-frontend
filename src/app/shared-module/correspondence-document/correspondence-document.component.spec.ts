import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CorrespondenceDocumentComponent } from './correspondence-document.component';

describe('CorrespondenceDocumentComponent', () => {
  let component: CorrespondenceDocumentComponent;
  let fixture: ComponentFixture<CorrespondenceDocumentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CorrespondenceDocumentComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CorrespondenceDocumentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
