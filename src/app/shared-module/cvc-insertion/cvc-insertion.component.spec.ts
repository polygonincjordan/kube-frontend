import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CvcInsertionComponent } from './cvc-insertion.component';

describe('CvcInsertionComponent', () => {
  let component: CvcInsertionComponent;
  let fixture: ComponentFixture<CvcInsertionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CvcInsertionComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CvcInsertionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
