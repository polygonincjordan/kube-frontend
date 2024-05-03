import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmerCommentsComponent } from './emer-comments.component';

describe('EmerCommentsComponent', () => {
  let component: EmerCommentsComponent;
  let fixture: ComponentFixture<EmerCommentsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EmerCommentsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmerCommentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
