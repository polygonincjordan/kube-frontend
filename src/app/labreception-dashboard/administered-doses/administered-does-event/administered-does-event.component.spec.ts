import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdministeredDoesEventComponent } from './administered-does-event.component';

describe('AdministeredDoesEventComponent', () => {
  let component: AdministeredDoesEventComponent;
  let fixture: ComponentFixture<AdministeredDoesEventComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AdministeredDoesEventComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdministeredDoesEventComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
