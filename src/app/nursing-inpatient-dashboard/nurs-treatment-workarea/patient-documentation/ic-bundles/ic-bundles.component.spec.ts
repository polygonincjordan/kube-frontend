import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ICBundlesComponent } from './ic-bundles.component';

describe('ICBundlesComponent', () => {
  let component: ICBundlesComponent;
  let fixture: ComponentFixture<ICBundlesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ICBundlesComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ICBundlesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
