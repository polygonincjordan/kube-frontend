import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HandOverprocessComponent } from './hand-overprocess.component';

describe('HandOverprocessComponent', () => {
  let component: HandOverprocessComponent;
  let fixture: ComponentFixture<HandOverprocessComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HandOverprocessComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HandOverprocessComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
