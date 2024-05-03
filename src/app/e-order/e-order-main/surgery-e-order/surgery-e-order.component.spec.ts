import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SurgeryEOrderComponent } from './surgery-e-order.component';

describe('SurgeryEOrderComponent', () => {
  let component: SurgeryEOrderComponent;
  let fixture: ComponentFixture<SurgeryEOrderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SurgeryEOrderComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SurgeryEOrderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
