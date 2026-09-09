import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PreChemohydrationComponent } from './pre-chemohydration.component';

describe('PreChemohydrationComponent', () => {
  let component: PreChemohydrationComponent;
  let fixture: ComponentFixture<PreChemohydrationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PreChemohydrationComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PreChemohydrationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
