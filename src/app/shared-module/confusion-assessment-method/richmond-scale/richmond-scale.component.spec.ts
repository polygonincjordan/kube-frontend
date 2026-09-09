import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RichmondScaleComponent } from './richmond-scale.component';

describe('RichmondScaleComponent', () => {
  let component: RichmondScaleComponent;
  let fixture: ComponentFixture<RichmondScaleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RichmondScaleComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RichmondScaleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
