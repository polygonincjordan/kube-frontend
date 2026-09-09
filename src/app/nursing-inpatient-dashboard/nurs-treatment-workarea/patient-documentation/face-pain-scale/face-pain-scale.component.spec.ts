import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FacePainScaleComponent } from './face-pain-scale.component';

describe('FacePainScaleComponent', () => {
  let component: FacePainScaleComponent;
  let fixture: ComponentFixture<FacePainScaleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FacePainScaleComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FacePainScaleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
