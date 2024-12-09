import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DislikePreferenceComponent } from './dislike-preference.component';

describe('DislikePreferenceComponent', () => {
  let component: DislikePreferenceComponent;
  let fixture: ComponentFixture<DislikePreferenceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DislikePreferenceComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DislikePreferenceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
