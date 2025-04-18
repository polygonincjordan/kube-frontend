import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SkinPhysicalTabComponent } from './skin-physical-tab.component';

describe('SkinPhysicalTabComponent', () => {
  let component: SkinPhysicalTabComponent;
  let fixture: ComponentFixture<SkinPhysicalTabComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SkinPhysicalTabComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SkinPhysicalTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
