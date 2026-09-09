import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PostDialysisEvaluationComponent } from './post-dialysis-evaluation.component';

describe('PostDialysisEvaluationComponent', () => {
  let component: PostDialysisEvaluationComponent;
  let fixture: ComponentFixture<PostDialysisEvaluationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PostDialysisEvaluationComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PostDialysisEvaluationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
