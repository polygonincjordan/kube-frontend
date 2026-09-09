import { DatePipe } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { AddministrationService } from '@services/e-Prescription/Administration.service';
import { EPrescriptionService } from '@services/e-Prescription/e-prescription.service';

@Component({
  selector: 'medication-tabs',
  templateUrl: './medication-tabs.component.html',
  styleUrls: ['./medication-tabs.component.scss']
})
export class MedicationTabsComponent implements OnInit {


  public medicationValidity: any;
  public durationUnit: any;
  public medicationForm: FormGroup = new FormGroup({
    EmpResp: new FormControl(""),
    OrderDepartment: new FormControl(""),
    OrderingTo: new FormControl(""),
    OrderingDept: new FormControl("")
  });
  public AdminiEmployeeresponsible: any;
  public AdminiOrderingList: any;

  @Input() MedicationData: any;

  @Output() medication: EventEmitter<any> = new EventEmitter<any>();
  @Input() set medicationdetailsdate(data: any) {
    this.medicationValidity = data.item;
    this.medicationForm.setValue(data.userData);
    this.durationUnit = this.medicationValidity.Pduru !== null && this.medicationValidity.Pduru !== "" ? this.administrationService.durationUnitList.find(d => d.Unit == this.medicationValidity.Pduru).Text : "";
  }
  constructor(public administrationService: AddministrationService, public ePrescriptionService: EPrescriptionService, private datePipe: DatePipe) { }

  ngOnInit(): void {
    // this.medicationForm.setValue(this.administrationService.medicationAdministrative)
    // this.medicationForm.valueChanges.subscribe((data) => {
    //   this.medication.emit(this.medicationForm.value);
    // });
  }

  parseTime(date) {
    const newDate = `${this.datePipe.transform(date, "hh:mm:ss")}`
    if (newDate) {
      return newDate
    }
    return null;
  }

}
