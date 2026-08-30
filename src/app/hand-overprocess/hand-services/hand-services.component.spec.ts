import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HandServicesComponent } from './hand-services.component';

describe('HandServicesComponent', () => {
  let component: HandServicesComponent;
  let fixture: ComponentFixture<HandServicesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HandServicesComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HandServicesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
