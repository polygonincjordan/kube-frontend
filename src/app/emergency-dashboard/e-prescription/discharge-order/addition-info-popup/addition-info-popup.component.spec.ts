import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdditionInfoPopupComponent } from './addition-info-popup.component';

describe('AdditionInfoPopupComponent', () => {
  let component: AdditionInfoPopupComponent;
  let fixture: ComponentFixture<AdditionInfoPopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AdditionInfoPopupComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdditionInfoPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
