import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IntakeOutputHistoryComponent } from './intake-output-history.component';

describe('IntakeOutputHistoryComponent', () => {
  let component: IntakeOutputHistoryComponent;
  let fixture: ComponentFixture<IntakeOutputHistoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ IntakeOutputHistoryComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IntakeOutputHistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
