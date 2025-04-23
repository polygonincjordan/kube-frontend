import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NIPSDocumentComponent } from './nips-document.component';

describe('NIPSDocumentComponent', () => {
  let component: NIPSDocumentComponent;
  let fixture: ComponentFixture<NIPSDocumentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NIPSDocumentComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NIPSDocumentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
