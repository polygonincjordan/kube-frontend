import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MedicationTableListComponent } from './medication-table-list.component';

describe('MedicationTableListComponent', () => {
  let component: MedicationTableListComponent;
  let fixture: ComponentFixture<MedicationTableListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MedicationTableListComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MedicationTableListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
