import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DocumentingDeliveryComponent } from './documenting-delivery.component';

describe('DocumentingDeliveryComponent', () => {
  let component: DocumentingDeliveryComponent;
  let fixture: ComponentFixture<DocumentingDeliveryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DocumentingDeliveryComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DocumentingDeliveryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
