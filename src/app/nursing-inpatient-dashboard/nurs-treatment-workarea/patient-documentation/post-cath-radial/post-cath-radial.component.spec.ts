import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PostCathRadialComponent } from './post-cath-radial.component';

describe('PostCathRadialComponent', () => {
  let component: PostCathRadialComponent;
  let fixture: ComponentFixture<PostCathRadialComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PostCathRadialComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PostCathRadialComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
