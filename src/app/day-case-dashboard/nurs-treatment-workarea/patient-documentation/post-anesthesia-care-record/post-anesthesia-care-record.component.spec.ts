import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PostAnesthesiaCareRecordComponent } from './post-anesthesia-care-record.component';

describe('PostAnesthesiaCareRecordComponent', () => {
  let component: PostAnesthesiaCareRecordComponent;
  let fixture: ComponentFixture<PostAnesthesiaCareRecordComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PostAnesthesiaCareRecordComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PostAnesthesiaCareRecordComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
