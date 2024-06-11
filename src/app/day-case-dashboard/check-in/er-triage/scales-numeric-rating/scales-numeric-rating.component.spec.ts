import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScalesNumericRatingComponent } from './scales-numeric-rating.component';

describe('ScalesNumericRatingComponent', () => {
  let component: ScalesNumericRatingComponent;
  let fixture: ComponentFixture<ScalesNumericRatingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ScalesNumericRatingComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ScalesNumericRatingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
