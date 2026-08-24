import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PriorComplexorderComponent } from './prior-complexorder.component';

describe('PriorComplexorderComponent', () => {
  let component: PriorComplexorderComponent;
  let fixture: ComponentFixture<PriorComplexorderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PriorComplexorderComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PriorComplexorderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
