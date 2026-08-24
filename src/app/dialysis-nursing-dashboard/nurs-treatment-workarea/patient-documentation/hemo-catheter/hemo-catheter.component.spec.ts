import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HemoCatheterComponent } from './hemo-catheter.component';

describe('HemoCatheterComponent', () => {
  let component: HemoCatheterComponent;
  let fixture: ComponentFixture<HemoCatheterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HemoCatheterComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HemoCatheterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
