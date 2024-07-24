import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MadicationProfileNursComponent } from './madication-profile-nurs.component';

describe('MadicationProfileNursComponent', () => {
  let component: MadicationProfileNursComponent;
  let fixture: ComponentFixture<MadicationProfileNursComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MadicationProfileNursComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MadicationProfileNursComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
