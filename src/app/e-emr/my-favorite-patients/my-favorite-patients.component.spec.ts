import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MyFavoritePatientsComponent } from './my-favorite-patients.component';

describe('MyFavoritePatientsComponent', () => {
  let component: MyFavoritePatientsComponent;
  let fixture: ComponentFixture<MyFavoritePatientsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MyFavoritePatientsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MyFavoritePatientsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
