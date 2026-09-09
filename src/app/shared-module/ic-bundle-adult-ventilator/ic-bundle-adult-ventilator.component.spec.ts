import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IcBundleAdultVentilatorComponent } from './ic-bundle-adult-ventilator.component';

describe('IcBundleAdultVentilatorComponent', () => {
  let component: IcBundleAdultVentilatorComponent;
  let fixture: ComponentFixture<IcBundleAdultVentilatorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ IcBundleAdultVentilatorComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IcBundleAdultVentilatorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
