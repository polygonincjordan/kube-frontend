import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MyEndoscopyComponent } from './my-endoscopy.component';

describe('MyEndoscopyComponent', () => {
  let component: MyEndoscopyComponent;
  let fixture: ComponentFixture<MyEndoscopyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MyEndoscopyComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MyEndoscopyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
