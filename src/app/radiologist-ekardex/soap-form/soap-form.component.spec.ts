import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SoapFormComponent } from './soap-form.component';

describe('SoapFormComponent', () => {
  let component: SoapFormComponent;
  let fixture: ComponentFixture<SoapFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SoapFormComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SoapFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
