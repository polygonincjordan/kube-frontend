import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SurgeryTableListComponent } from './surgery-table-list.component';

describe('SurgeryTableListComponent', () => {
  let component: SurgeryTableListComponent;
  let fixture: ComponentFixture<SurgeryTableListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SurgeryTableListComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SurgeryTableListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
