import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CardiopulmanaryResComponent } from './cardiopulmanary-res.component';

describe('CardiopulmanaryResComponent', () => {
  let component: CardiopulmanaryResComponent;
  let fixture: ComponentFixture<CardiopulmanaryResComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CardiopulmanaryResComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CardiopulmanaryResComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
