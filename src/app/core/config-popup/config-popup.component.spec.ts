import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfigPopup } from './config-popup.component';

describe('ConfigPopup', () => {
  let component: ConfigPopup;
  let fixture: ComponentFixture<ConfigPopup>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ConfigPopup ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConfigPopup);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
