import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AnalisysDashboardComponent } from './analisys-dashboard.component';

describe('AnalisysDashboardComponent', () => {
  let component: AnalisysDashboardComponent;
  let fixture: ComponentFixture<AnalisysDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AnalisysDashboardComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AnalisysDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
