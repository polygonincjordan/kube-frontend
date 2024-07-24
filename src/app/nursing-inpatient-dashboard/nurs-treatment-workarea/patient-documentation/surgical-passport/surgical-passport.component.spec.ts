import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SurgicalPassportComponent } from './surgical-passport.component';

describe('SurgicalPassportComponent', () => {
  let component: SurgicalPassportComponent;
  let fixture: ComponentFixture<SurgicalPassportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SurgicalPassportComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SurgicalPassportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
