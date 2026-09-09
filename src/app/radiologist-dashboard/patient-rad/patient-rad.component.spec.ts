/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { PatientRadComponent } from './patient-rad.component';

describe('PatientRadComponent', () => {
  let component: PatientRadComponent;
  let fixture: ComponentFixture<PatientRadComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [PatientRadComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PatientRadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
