import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChemoHydrationComponent } from './chemo-hydration.component';

describe('ChemoHydrationComponent', () => {
  let component: ChemoHydrationComponent;
  let fixture: ComponentFixture<ChemoHydrationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ChemoHydrationComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChemoHydrationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
