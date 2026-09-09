import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmergencyNursingDocumentComponent } from './emergency-nursing-document.component';

describe('EmergencyNursingDocumentComponent', () => {
  let component: EmergencyNursingDocumentComponent;
  let fixture: ComponentFixture<EmergencyNursingDocumentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EmergencyNursingDocumentComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmergencyNursingDocumentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
