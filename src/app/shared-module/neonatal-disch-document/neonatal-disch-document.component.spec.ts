import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NeonatalDischDocumentComponent } from './neonatal-disch-document.component';

describe('NeonatalDischDocumentComponent', () => {
  let component: NeonatalDischDocumentComponent;
  let fixture: ComponentFixture<NeonatalDischDocumentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NeonatalDischDocumentComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NeonatalDischDocumentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
