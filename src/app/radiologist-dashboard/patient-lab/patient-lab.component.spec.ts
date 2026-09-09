/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { PatientLabComponent } from './patient-lab.component';

describe('PatientLabComponent', () => {
  let component: PatientLabComponent;
  let fixture: ComponentFixture<PatientLabComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [PatientLabComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PatientLabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
