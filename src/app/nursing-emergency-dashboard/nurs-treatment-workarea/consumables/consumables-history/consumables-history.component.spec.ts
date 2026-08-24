import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsumablesHistoryComponent } from './consumables-history.component';

describe('ConsumablesHistoryComponent', () => {
  let component: ConsumablesHistoryComponent;
  let fixture: ComponentFixture<ConsumablesHistoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ConsumablesHistoryComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConsumablesHistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
