import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LaboratoryTableListComponent } from './laboratory-table-list.component';

describe('LaboratoryTableListComponent', () => {
  let component: LaboratoryTableListComponent;
  let fixture: ComponentFixture<LaboratoryTableListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LaboratoryTableListComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LaboratoryTableListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
