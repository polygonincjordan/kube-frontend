import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CprDocumentComponent } from './cpr-document.component';

describe('CprDocumentComponent', () => {
  let component: CprDocumentComponent;
  let fixture: ComponentFixture<CprDocumentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CprDocumentComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CprDocumentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
