import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScalesGlosgowComaComponent } from './scales-glosgow-coma.component';

describe('ScalesGlosgowComaComponent', () => {
  let component: ScalesGlosgowComaComponent;
  let fixture: ComponentFixture<ScalesGlosgowComaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ScalesGlosgowComaComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ScalesGlosgowComaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
