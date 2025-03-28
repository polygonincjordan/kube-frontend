import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CvcMaintenanceComponent } from './cvc-maintenance.component';

describe('CvcMaintenanceComponent', () => {
  let component: CvcMaintenanceComponent;
  let fixture: ComponentFixture<CvcMaintenanceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CvcMaintenanceComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CvcMaintenanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
