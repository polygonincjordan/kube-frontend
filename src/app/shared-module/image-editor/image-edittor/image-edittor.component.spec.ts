import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ImageEdittorComponent } from './image-edittor.component';

describe('ImageEdittorComponent', () => {
  let component: ImageEdittorComponent;
  let fixture: ComponentFixture<ImageEdittorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ImageEdittorComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ImageEdittorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
