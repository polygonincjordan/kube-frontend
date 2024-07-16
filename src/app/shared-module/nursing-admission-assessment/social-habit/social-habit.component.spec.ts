import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SocialHabitComponent } from './social-habit.component';

describe('SocialHabitComponent', () => {
  let component: SocialHabitComponent;
  let fixture: ComponentFixture<SocialHabitComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SocialHabitComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SocialHabitComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
