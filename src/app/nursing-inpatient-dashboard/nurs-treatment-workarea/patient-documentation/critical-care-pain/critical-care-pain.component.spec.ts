import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CriticalCarePainComponent } from './critical-care-pain.component';

describe('CriticalCarePainComponent', () => {
  let component: CriticalCarePainComponent;
  let fixture: ComponentFixture<CriticalCarePainComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CriticalCarePainComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CriticalCarePainComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
