import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChemotherapeuticBiologicComponent } from './chemotherapeutic-biologic.component';

describe('ChemotherapeuticBiologicComponent', () => {
  let component: ChemotherapeuticBiologicComponent;
  let fixture: ComponentFixture<ChemotherapeuticBiologicComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ChemotherapeuticBiologicComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChemotherapeuticBiologicComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
