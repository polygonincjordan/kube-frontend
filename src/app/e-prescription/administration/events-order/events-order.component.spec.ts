import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EventsOrderComponent } from './events-order.component';

describe('EventsOrderComponent', () => {
  let component: EventsOrderComponent;
  let fixture: ComponentFixture<EventsOrderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EventsOrderComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EventsOrderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
