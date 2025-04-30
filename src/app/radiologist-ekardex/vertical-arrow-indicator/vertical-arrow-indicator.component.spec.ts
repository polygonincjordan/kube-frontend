import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VerticalArrowIndicatorComponent } from './vertical-arrow-indicator.component';

describe('VerticalArrowIndicatorComponent', () => {
  let component: VerticalArrowIndicatorComponent;
  let fixture: ComponentFixture<VerticalArrowIndicatorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [VerticalArrowIndicatorComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(VerticalArrowIndicatorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
