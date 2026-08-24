import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MedicationTabsComponent } from './medication-tabs.component';

describe('MedicationTabsComponent', () => {
  let component: MedicationTabsComponent;
  let fixture: ComponentFixture<MedicationTabsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MedicationTabsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MedicationTabsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
