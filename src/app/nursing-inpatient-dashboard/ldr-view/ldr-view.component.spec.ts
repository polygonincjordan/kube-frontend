import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LdrViewComponent } from './ldr-view.component';

describe('LdrViewComponent', () => {
  let component: LdrViewComponent;
  let fixture: ComponentFixture<LdrViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LdrViewComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LdrViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
