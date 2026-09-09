import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ArrivalMainListComponent } from './arrival-main-list.component';

describe('ArrivalMainListComponent', () => {
  let component: ArrivalMainListComponent;
  let fixture: ComponentFixture<ArrivalMainListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ArrivalMainListComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ArrivalMainListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
