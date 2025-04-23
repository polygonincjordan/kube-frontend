import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeliveryRecordDocComponent } from './delivery-record-doc.component';

describe('DeliveryRecordDocComponent', () => {
  let component: DeliveryRecordDocComponent;
  let fixture: ComponentFixture<DeliveryRecordDocComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DeliveryRecordDocComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DeliveryRecordDocComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
