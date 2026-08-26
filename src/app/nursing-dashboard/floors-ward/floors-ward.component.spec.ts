import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FloorsWardComponent } from './floors-ward.component';

describe('FloorsWardComponent', () => {
  let component: FloorsWardComponent;
  let fixture: ComponentFixture<FloorsWardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FloorsWardComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FloorsWardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
