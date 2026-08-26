import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ErPhysicianComponent } from './er-physician.component';

describe('ErPhysicianComponent', () => {
  let component: ErPhysicianComponent;
  let fixture: ComponentFixture<ErPhysicianComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ErPhysicianComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ErPhysicianComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
