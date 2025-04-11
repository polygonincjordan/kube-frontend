import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MaternityEarlyWarningSignComponent } from './maternity-early-warning-sign.component';


describe('MaternityEarlyWarningSignComponent', () => {
  let component: MaternityEarlyWarningSignComponent;
  let fixture: ComponentFixture<MaternityEarlyWarningSignComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MaternityEarlyWarningSignComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MaternityEarlyWarningSignComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
