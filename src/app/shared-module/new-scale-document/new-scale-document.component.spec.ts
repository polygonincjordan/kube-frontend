import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewScaleDocumentComponent } from './new-scale-document.component';

describe('NewScaleDocumentComponent', () => {
  let component: NewScaleDocumentComponent;
  let fixture: ComponentFixture<NewScaleDocumentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NewScaleDocumentComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NewScaleDocumentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
