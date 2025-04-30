/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { InPatientsComponent } from './in-patients.component';

describe('InPatientsComponent', () => {
  let component: InPatientsComponent;
  let fixture: ComponentFixture<InPatientsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [InPatientsComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InPatientsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
