import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HeaderChemoComponent } from './header-chemo.component';

describe('HeaderChemoComponent', () => {
  let component: HeaderChemoComponent;
  let fixture: ComponentFixture<HeaderChemoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HeaderChemoComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HeaderChemoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
