import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrietationPatientTabComponent } from './orietation-patient-tab.component';

describe('OrietationPatientTabComponent', () => {
  let component: OrietationPatientTabComponent;
  let fixture: ComponentFixture<OrietationPatientTabComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OrietationPatientTabComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OrietationPatientTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
