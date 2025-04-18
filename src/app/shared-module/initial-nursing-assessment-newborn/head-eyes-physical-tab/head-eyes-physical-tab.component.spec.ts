import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HeadEyesPhysicalTabComponent } from './head-eyes-physical-tab.component';

describe('HeadEyesPhysicalTabComponent', () => {
  let component: HeadEyesPhysicalTabComponent;
  let fixture: ComponentFixture<HeadEyesPhysicalTabComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HeadEyesPhysicalTabComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HeadEyesPhysicalTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
