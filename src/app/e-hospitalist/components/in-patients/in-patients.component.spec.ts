import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InPatientsComponent } from './in-patients.component';

describe('InPatientsComponent', () => {
  let component: InPatientsComponent;
  let fixture: ComponentFixture<InPatientsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InPatientsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InPatientsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
