import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PostCathFemoralComponent } from './post-cath-femoral.component';

describe('PostCathFemoralComponent', () => {
  let component: PostCathFemoralComponent;
  let fixture: ComponentFixture<PostCathFemoralComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PostCathFemoralComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PostCathFemoralComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
