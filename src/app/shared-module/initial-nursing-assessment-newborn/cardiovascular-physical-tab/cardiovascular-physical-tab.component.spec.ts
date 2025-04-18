import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CardiovascularPhysicalTabComponent } from './cardiovascular-physical-tab.component';

describe('CardiovascularPhysicalTabComponent', () => {
  let component: CardiovascularPhysicalTabComponent;
  let fixture: ComponentFixture<CardiovascularPhysicalTabComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CardiovascularPhysicalTabComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CardiovascularPhysicalTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
