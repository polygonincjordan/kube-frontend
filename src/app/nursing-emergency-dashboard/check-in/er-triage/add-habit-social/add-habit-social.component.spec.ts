import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddHabitSocialComponent } from './add-habit-social.component';

describe('AddHabitSocialComponent', () => {
  let component: AddHabitSocialComponent;
  let fixture: ComponentFixture<AddHabitSocialComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddHabitSocialComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddHabitSocialComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
