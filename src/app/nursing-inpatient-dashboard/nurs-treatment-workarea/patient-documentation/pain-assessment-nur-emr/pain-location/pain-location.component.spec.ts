import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PainLocationComponent } from './pain-location.component';

describe('PainLocationComponent', () => {
  let component: PainLocationComponent;
  let fixture: ComponentFixture<PainLocationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PainLocationComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PainLocationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
