import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminAttechmentComponent } from './admin-attechment.component';

describe('AdminAttechmentComponent', () => {
  let component: AdminAttechmentComponent;
  let fixture: ComponentFixture<AdminAttechmentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AdminAttechmentComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminAttechmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
