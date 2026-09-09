import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScalesFacePainComponent } from './scales-face-pain.component';

describe('ScalesFacePainComponent', () => {
  let component: ScalesFacePainComponent;
  let fixture: ComponentFixture<ScalesFacePainComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ScalesFacePainComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ScalesFacePainComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
