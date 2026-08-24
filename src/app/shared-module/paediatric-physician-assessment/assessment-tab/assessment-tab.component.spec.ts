import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssessmentTabComponent } from './assessment-tab.component';

describe('AssessmentTabComponent', () => {
  let component: AssessmentTabComponent;
  let fixture: ComponentFixture<AssessmentTabComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AssessmentTabComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AssessmentTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
