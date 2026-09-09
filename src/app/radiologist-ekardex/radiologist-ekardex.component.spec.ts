import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RadiologistEkardexComponent } from './radiologist-ekardex.component';

describe('RadiologistEkardexComponent', () => {
  let component: RadiologistEkardexComponent;
  let fixture: ComponentFixture<RadiologistEkardexComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RadiologistEkardexComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RadiologistEkardexComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
