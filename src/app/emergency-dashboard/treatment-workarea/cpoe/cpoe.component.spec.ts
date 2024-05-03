/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { CpoeComponent } from './cpoe.component';

describe('CpoeComponent', () => {
  let component: CpoeComponent;
  let fixture: ComponentFixture<CpoeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CpoeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CpoeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
