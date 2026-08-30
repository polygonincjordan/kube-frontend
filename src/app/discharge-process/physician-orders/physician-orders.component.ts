import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AdmissionService } from '@services/admission/admission.service';
import { EPrescriptionService } from '@services/e-Prescription/e-prescription.service';

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
    public admissionService: AdmissionService,
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
    if (this.admissionService.PhysicianOrders) {
      this.onSearchChangEvent.next(event.target.value);
    } else if (this.admissionService.ProgressNotes) {
      this.onSearchChangEventForProgressNotes.next(event.target.value);
    }
  }

  onDateChange() {
    if (this.admissionService.PhysicianOrders) {
      this.onSetDateFilterEvent.next(this.formDetailGroup);
    } else if (this.admissionService.ProgressNotes) {
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
