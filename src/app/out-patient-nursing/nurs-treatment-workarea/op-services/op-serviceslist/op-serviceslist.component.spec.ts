import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OpServiceslistComponent } from './op-serviceslist.component';

describe('OpServiceslistComponent', () => {
  let component: OpServiceslistComponent;
  let fixture: ComponentFixture<OpServiceslistComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OpServiceslistComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OpServiceslistComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
