import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FrequencyDeftimComponent } from './frequency-deftim.component';

describe('FrequencyDeftimComponent', () => {
  let component: FrequencyDeftimComponent;
  let fixture: ComponentFixture<FrequencyDeftimComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FrequencyDeftimComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FrequencyDeftimComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
