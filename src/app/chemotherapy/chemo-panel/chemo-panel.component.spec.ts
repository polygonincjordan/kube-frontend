import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChemoPanelComponent } from './chemo-panel.component';

describe('ChemoPanelComponent', () => {
  let component: ChemoPanelComponent;
  let fixture: ComponentFixture<ChemoPanelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ChemoPanelComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChemoPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
