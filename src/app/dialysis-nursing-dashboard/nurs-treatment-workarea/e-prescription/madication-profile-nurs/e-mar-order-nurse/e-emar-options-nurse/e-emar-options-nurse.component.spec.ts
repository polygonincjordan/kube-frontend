import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EEmarOptionsNurseComponent } from './e-emar-options-nurse.component';

describe('EEmarOptionsNurseComponent', () => {
  let component: EEmarOptionsNurseComponent;
  let fixture: ComponentFixture<EEmarOptionsNurseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EEmarOptionsNurseComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EEmarOptionsNurseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
