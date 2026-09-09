import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ErTriageComponent } from './er-triage.component';

describe('ErTriageComponent', () => {
  let component: ErTriageComponent;
  let fixture: ComponentFixture<ErTriageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ErTriageComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ErTriageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
