import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ErVitalComponent } from './er-vital.component';

describe('ErVitalComponent', () => {
  let component: ErVitalComponent;
  let fixture: ComponentFixture<ErVitalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ErVitalComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ErVitalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
