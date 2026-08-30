import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlannedAdministrationComponent } from './planned-administration.component';

describe('PlannedAdministrationComponent', () => {
  let component: PlannedAdministrationComponent;
  let fixture: ComponentFixture<PlannedAdministrationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PlannedAdministrationComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PlannedAdministrationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
