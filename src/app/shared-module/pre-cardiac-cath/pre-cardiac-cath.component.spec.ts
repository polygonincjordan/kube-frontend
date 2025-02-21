import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PreCardiacCathComponent } from './pre-cardiac-cath.component';

describe('PreCardiacCathComponent', () => {
  let component: PreCardiacCathComponent;
  let fixture: ComponentFixture<PreCardiacCathComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PreCardiacCathComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PreCardiacCathComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
