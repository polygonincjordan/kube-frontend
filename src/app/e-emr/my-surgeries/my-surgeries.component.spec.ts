import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MySurgeriesComponent } from './my-surgeries.component';

describe('MySurgeriesComponent', () => {
  let component: MySurgeriesComponent;
  let fixture: ComponentFixture<MySurgeriesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MySurgeriesComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MySurgeriesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
