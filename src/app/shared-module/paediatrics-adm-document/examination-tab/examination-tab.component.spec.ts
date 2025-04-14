import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExaminationTabComponent } from './examination-tab.component';

describe('ExaminationTabComponent', () => {
  let component: ExaminationTabComponent;
  let fixture: ComponentFixture<ExaminationTabComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ExaminationTabComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExaminationTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
