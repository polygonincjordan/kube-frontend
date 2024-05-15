import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BedViewItemComponent } from './bed-view-item.component';

describe('BedViewItemComponent', () => {
  let component: BedViewItemComponent;
  let fixture: ComponentFixture<BedViewItemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BedViewItemComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BedViewItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
