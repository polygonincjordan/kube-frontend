import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HemodialysisFistulaGraftComponent } from './hemodialysis-fistula-graft.component';

describe('HemodialysisFistulaGraftComponent', () => {
  let component: HemodialysisFistulaGraftComponent;
  let fixture: ComponentFixture<HemodialysisFistulaGraftComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HemodialysisFistulaGraftComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HemodialysisFistulaGraftComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
