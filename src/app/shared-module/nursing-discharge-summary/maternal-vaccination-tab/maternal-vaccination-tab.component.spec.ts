import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MaternalVaccinationTabComponent } from './maternal-vaccination-tab.component';

describe('MaternalVaccinationTabComponent', () => {
  let component: MaternalVaccinationTabComponent;
  let fixture: ComponentFixture<MaternalVaccinationTabComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MaternalVaccinationTabComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MaternalVaccinationTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
