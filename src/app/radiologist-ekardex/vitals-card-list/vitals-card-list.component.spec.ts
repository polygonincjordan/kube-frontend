import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VitalsCardListComponent } from './vitals-card-list.component';

describe('VitalsCardListComponent', () => {
  let component: VitalsCardListComponent;
  let fixture: ComponentFixture<VitalsCardListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [VitalsCardListComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(VitalsCardListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
