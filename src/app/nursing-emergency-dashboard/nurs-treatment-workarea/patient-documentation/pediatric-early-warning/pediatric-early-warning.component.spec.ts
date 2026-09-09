import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PediatricEarlyWarningComponent } from './pediatric-early-warning.component';

describe('PediatricEarlyWarningComponent', () => {
  let component: PediatricEarlyWarningComponent;
  let fixture: ComponentFixture<PediatricEarlyWarningComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PediatricEarlyWarningComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PediatricEarlyWarningComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
