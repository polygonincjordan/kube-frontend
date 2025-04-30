import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewBornPopupComponent } from './new-born-popup.component';

describe('NewBornPopupComponent', () => {
  let component: NewBornPopupComponent;
  let fixture: ComponentFixture<NewBornPopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NewBornPopupComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NewBornPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
