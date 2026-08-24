import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ObsVTEAnteptmComponent } from './obs-vte-anteptm.component';

describe('ObsVTEAnteptmComponent', () => {
  let component: ObsVTEAnteptmComponent;
  let fixture: ComponentFixture<ObsVTEAnteptmComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ObsVTEAnteptmComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ObsVTEAnteptmComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
