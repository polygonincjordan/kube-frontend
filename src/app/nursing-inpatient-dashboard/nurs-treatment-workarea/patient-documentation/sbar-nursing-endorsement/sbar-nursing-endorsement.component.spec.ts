import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SbarNursingEndorsementComponent } from './sbar-nursing-endorsement.component';

describe('SbarNursingEndorsementComponent', () => {
  let component: SbarNursingEndorsementComponent;
  let fixture: ComponentFixture<SbarNursingEndorsementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SbarNursingEndorsementComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SbarNursingEndorsementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
