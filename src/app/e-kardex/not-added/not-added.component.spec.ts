import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NotAddedComponent } from './not-added.component';

describe('NotAddedComponent', () => {
  let component: NotAddedComponent;
  let fixture: ComponentFixture<NotAddedComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [NotAddedComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(NotAddedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
