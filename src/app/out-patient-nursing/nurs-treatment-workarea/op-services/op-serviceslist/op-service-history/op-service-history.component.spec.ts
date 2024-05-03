import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OpServiceHistoryComponent } from './op-service-history.component';

describe('OpServiceHistoryComponent', () => {
  let component: OpServiceHistoryComponent;
  let fixture: ComponentFixture<OpServiceHistoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OpServiceHistoryComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OpServiceHistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
