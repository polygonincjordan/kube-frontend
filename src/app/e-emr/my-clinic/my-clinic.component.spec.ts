/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { MyClinicComponent } from './my-clinic.component';

describe('MyClinicComponent', () => {
  let component: MyClinicComponent;
  let fixture: ComponentFixture<MyClinicComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [MyClinicComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MyClinicComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
