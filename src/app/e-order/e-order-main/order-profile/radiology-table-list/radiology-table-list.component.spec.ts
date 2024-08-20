import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RadiologyTableListComponent } from './radiology-table-list.component';

describe('RadiologyTableListComponent', () => {
  let component: RadiologyTableListComponent;
  let fixture: ComponentFixture<RadiologyTableListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RadiologyTableListComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RadiologyTableListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
