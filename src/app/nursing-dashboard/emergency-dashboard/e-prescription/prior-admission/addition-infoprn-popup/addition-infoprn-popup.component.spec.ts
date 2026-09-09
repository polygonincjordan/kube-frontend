import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdditionInfoprnPopupComponent } from './addition-infoprn-popup.component';

describe('AdditionInfoprnPopupComponent', () => {
  let component: AdditionInfoprnPopupComponent;
  let fixture: ComponentFixture<AdditionInfoprnPopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AdditionInfoprnPopupComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdditionInfoprnPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
