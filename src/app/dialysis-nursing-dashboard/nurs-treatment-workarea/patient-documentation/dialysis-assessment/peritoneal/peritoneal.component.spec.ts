import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PeritonealComponent } from './peritoneal.component';

describe('PeritonealComponent', () => {
  let component: PeritonealComponent;
  let fixture: ComponentFixture<PeritonealComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PeritonealComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PeritonealComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
