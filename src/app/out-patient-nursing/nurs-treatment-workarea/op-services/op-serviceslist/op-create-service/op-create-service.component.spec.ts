import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OpCreateServiceComponent } from './op-create-service.component';

describe('OpCreateServiceComponent', () => {
  let component: OpCreateServiceComponent;
  let fixture: ComponentFixture<OpCreateServiceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OpCreateServiceComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OpCreateServiceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
