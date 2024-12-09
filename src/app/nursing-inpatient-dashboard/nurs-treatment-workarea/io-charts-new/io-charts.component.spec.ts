import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IoChartsComponent } from './io-charts.component';

describe('IoChartsComponent', () => {
  let component: IoChartsComponent;
  let fixture: ComponentFixture<IoChartsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ IoChartsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IoChartsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
