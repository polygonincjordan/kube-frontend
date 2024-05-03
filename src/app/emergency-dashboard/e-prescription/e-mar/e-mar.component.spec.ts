import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmarComponent } from './e-mar.component';

describe('EmarComponent', () => {
  let component: EmarComponent;
  let fixture: ComponentFixture<EmarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EmarComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
