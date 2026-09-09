/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { ObsGynComponent } from './obs-gyn.component';

describe('ObsGynComponent', () => {
  let component: ObsGynComponent;
  let fixture: ComponentFixture<ObsGynComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ObsGynComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ObsGynComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
