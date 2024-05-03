import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModetailPanelComponent } from './modetail-panel.component';

describe('ModetailPanelComponent', () => {
  let component: ModetailPanelComponent;
  let fixture: ComponentFixture<ModetailPanelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ModetailPanelComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModetailPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
