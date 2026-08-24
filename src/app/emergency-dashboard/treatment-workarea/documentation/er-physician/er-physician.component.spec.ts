/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { ErPhysicianComponent } from './er-physician.component';

describe('ErPhysicianComponent', () => {
  let component: ErPhysicianComponent;
  let fixture: ComponentFixture<ErPhysicianComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ErPhysicianComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ErPhysicianComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
