import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HaemodialysisAccessComponent } from './haemodialysis-access.component';

describe('HaemodialysisAccessComponent', () => {
  let component: HaemodialysisAccessComponent;
  let fixture: ComponentFixture<HaemodialysisAccessComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HaemodialysisAccessComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HaemodialysisAccessComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
