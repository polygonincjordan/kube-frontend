import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateEorderComponent } from './create-e-order.component';

describe('CreateEorderComponent', () => {
  let component: CreateEorderComponent;
  let fixture: ComponentFixture<CreateEorderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CreateEorderComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CreateEorderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
