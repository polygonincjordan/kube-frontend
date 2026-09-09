import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MedicationsProfileComponent } from './medications-profile.component';

describe('MedicationsProfileComponent', () => {
  let component: MedicationsProfileComponent;
  let fixture: ComponentFixture<MedicationsProfileComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MedicationsProfileComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MedicationsProfileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
