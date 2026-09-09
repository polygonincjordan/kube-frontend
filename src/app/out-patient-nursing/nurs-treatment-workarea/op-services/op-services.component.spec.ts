import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OpServicesComponent } from './op-services.component';

describe('OpServicesComponent', () => {
  let component: OpServicesComponent;
  let fixture: ComponentFixture<OpServicesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OpServicesComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OpServicesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
