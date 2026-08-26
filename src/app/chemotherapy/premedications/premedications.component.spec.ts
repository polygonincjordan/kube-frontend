import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PremedicationsComponent } from './premedications.component';

describe('PremedicationsComponent', () => {
  let component: PremedicationsComponent;
  let fixture: ComponentFixture<PremedicationsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PremedicationsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PremedicationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
