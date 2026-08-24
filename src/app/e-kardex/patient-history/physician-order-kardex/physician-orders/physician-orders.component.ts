import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { EPrescriptionService } from '@services/e-Prescription/e-prescription.service';
import { EmergencyService } from '@services/emergency-dashboard/emergency-service';

@Component({
  selector: 'app-physician-orders',
  templateUrl: './physician-orders.component.html',
  styleUrls: ['./physician-orders.component.scss'],
})
export class PhysicianOrdersComponent implements OnInit {
  @Input() occupationalGroupData: any;
  @Output() onSearchChangEvent = new EventEmitter();
  @Output() onSetDateFilterEvent = new EventEmitter();
  @Output() onSetOccupFilterEvent = new EventEmitter();
  @Output() onSetDateFilterEventForProgressNotes = new EventEmitter();
  @Output() onSearchChangEventForProgressNotes = new EventEmitter();

  formDetailGroup: FormGroup;

  constructor(
    public ePrescriptionService: EPrescriptionService,
    public emergencyService: EmergencyService,
    private formBuilder: FormBuilder
  ) {}

  ngOnInit(): void {
    this.phyOrderForm();
  }

  phyOrderForm() {
    this.formDetailGroup = this.formBuilder.group({
      SearchData: ['', [Validators.required]],
      DateRange: [[], [Validators.required]],
      SelectDropdown: [null, [Validators.required]],
    });
  }

  allOrderRemoveDateFilter() {
    this.formDetailGroup.controls.DateRange.setValue([]);
    this.onDateChange();
  }

  onSearchChange(event: any): void {
    if (this.emergencyService.PhysicianOrders) {
      this.onSearchChangEvent.next(event.target.value);
    } else if (this.emergencyService.ProgressNotes) {
      this.onSearchChangEventForProgressNotes.next(event.target.value);
    }
  }

  onDateChange() {
    if (this.emergencyService.PhysicianOrders) {
      this.onSetDateFilterEvent.next(this.formDetailGroup);
    } else if (this.emergencyService.ProgressNotes) {
      this.onSetDateFilterEventForProgressNotes.next(this.formDetailGroup);
    }
  }

  resetFilter() {
    if (this.formDetailGroup.value.SearchData) {
      this.onSearchChangEvent.next('');
    }
    this.phyOrderForm();
    this.onSetDateFilterEvent.next(this.formDetailGroup);    
  }
}
