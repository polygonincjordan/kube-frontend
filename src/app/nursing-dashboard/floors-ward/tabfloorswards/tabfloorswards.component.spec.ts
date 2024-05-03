import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TabfloorswardsComponent } from './tabfloorswards.component';

describe('TabfloorswardsComponent', () => {
  let component: TabfloorswardsComponent;
  let fixture: ComponentFixture<TabfloorswardsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TabfloorswardsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TabfloorswardsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
