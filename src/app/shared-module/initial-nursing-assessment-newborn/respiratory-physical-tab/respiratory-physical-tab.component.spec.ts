import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RespiratoryPhysicalTabComponent } from './respiratory-physical-tab.component';

describe('RespiratoryPhysicalTabComponent', () => {
  let component: RespiratoryPhysicalTabComponent;
  let fixture: ComponentFixture<RespiratoryPhysicalTabComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RespiratoryPhysicalTabComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RespiratoryPhysicalTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
