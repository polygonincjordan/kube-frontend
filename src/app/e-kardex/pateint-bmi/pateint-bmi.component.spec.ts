import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PateintBmiComponent } from './pateint-bmi.component';

describe('PateintBmiComponent', () => {
  let component: PateintBmiComponent;
  let fixture: ComponentFixture<PateintBmiComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PateintBmiComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PateintBmiComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
