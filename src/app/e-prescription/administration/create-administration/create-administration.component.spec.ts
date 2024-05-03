import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateAdministrationComponent } from './create-administration.component';

describe('CreateAdministrationComponent', () => {
  let component: CreateAdministrationComponent;
  let fixture: ComponentFixture<CreateAdministrationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CreateAdministrationComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateAdministrationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
