import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClinicWebCamComponent } from './web-cam.component';

describe('ClinicWebCamComponent', () => {
  let component: ClinicWebCamComponent;
  let fixture: ComponentFixture<ClinicWebCamComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ClinicWebCamComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ClinicWebCamComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
