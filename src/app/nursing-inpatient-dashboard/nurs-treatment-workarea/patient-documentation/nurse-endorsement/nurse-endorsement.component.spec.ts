import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NurseEndorsementComponent } from './nurse-endorsement.component';

describe('NurseEndorsementComponent', () => {
  let component: NurseEndorsementComponent;
  let fixture: ComponentFixture<NurseEndorsementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NurseEndorsementComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NurseEndorsementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
