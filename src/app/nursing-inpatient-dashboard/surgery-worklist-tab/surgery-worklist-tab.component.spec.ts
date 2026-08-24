import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SurgeryWorklistTabComponent } from './surgery-worklist-tab.component';

describe('SurgeryWorklistTabComponent', () => {
  let component: SurgeryWorklistTabComponent;
  let fixture: ComponentFixture<SurgeryWorklistTabComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SurgeryWorklistTabComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SurgeryWorklistTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
