import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BedViewItemsPatnrComponent } from './bed-view-items-patnr.component';

describe('BedViewItemsPatnrComponent', () => {
  let component: BedViewItemsPatnrComponent;
  let fixture: ComponentFixture<BedViewItemsPatnrComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BedViewItemsPatnrComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BedViewItemsPatnrComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
