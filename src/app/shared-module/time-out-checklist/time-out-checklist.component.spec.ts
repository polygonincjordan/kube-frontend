import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TimeOutChecklistComponent } from './time-out-checklist.component';

describe('TimeOutChecklistComponent', () => {
  let component: TimeOutChecklistComponent;
  let fixture: ComponentFixture<TimeOutChecklistComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TimeOutChecklistComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TimeOutChecklistComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
