import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GenitourinaryPhysicalTabComponent } from './genitourinary-physical-tab.component';

describe('GenitourinaryPhysicalTabComponent', () => {
  let component: GenitourinaryPhysicalTabComponent;
  let fixture: ComponentFixture<GenitourinaryPhysicalTabComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GenitourinaryPhysicalTabComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GenitourinaryPhysicalTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
