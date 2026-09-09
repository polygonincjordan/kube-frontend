import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MedicationsPopupComponent } from './medications-popup.component';

describe('MedicationsPopupComponent', () => {
  let component: MedicationsPopupComponent;
  let fixture: ComponentFixture<MedicationsPopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MedicationsPopupComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MedicationsPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
