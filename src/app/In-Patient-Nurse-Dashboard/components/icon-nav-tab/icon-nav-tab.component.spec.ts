import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IconNavTabComponent } from './icon-nav-tab.component';

describe('IconNavTabComponent', () => {
  let component: IconNavTabComponent;
  let fixture: ComponentFixture<IconNavTabComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ IconNavTabComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IconNavTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
