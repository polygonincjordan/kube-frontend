import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IconBoxSideMenuComponent } from './icon-box-side-menu.component';

describe('IconNavTabComponent', () => {
  let component: IconBoxSideMenuComponent;
  let fixture: ComponentFixture<IconBoxSideMenuComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ IconBoxSideMenuComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IconBoxSideMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
