import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IntraOperativeRecordComponent } from './intra-operative-record.component';

describe('IntraOperativeRecordComponent', () => {
  let component: IntraOperativeRecordComponent;
  let fixture: ComponentFixture<IntraOperativeRecordComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ IntraOperativeRecordComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IntraOperativeRecordComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
