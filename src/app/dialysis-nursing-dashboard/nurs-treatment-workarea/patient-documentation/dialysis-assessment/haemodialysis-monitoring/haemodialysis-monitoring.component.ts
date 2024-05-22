import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { EmergencyService } from '@services/emergency-dashboard/emergency-service';
import { PatientDocumentationService } from '@services/patient-documentation.service';
import { SharedService } from '@services/shared.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'haemodialysis-monitoring',
  templateUrl: './haemodialysis-monitoring.component.html',
  styleUrls: ['./haemodialysis-monitoring.component.scss']
})
export class HaemodialysisMonitoringComponent implements OnInit {
  private subscription: Subscription;
  haemomonitoring: FormGroup<any>;
  hemolineinfection: any;

  constructor(private sharedService: SharedService, private emergencyService: EmergencyService, protected patientDocService: PatientDocumentationService, private fb:FormBuilder) {
    this.haemomonitoring = this.patientDocService.dialysisAssecementForm
  }

  ngOnInit(): void {
      this.generateDefaultForm();
  }

  generateDefaultForm(){
    for(let i=0;i < 6;i++){
      this.ToMonitor.push(this.createForm(i));
    }
  }

  get ToMonitor() {
    return this.patientDocService.dialysisAssecementForm.get('TOMONITOR') as FormArray;
  }

  createForm(index?){
    return new FormGroup({
      Dockey : new FormControl(""),
      Timee : new FormControl(""),
      Bfr : new FormControl(""),
      Ap : new FormControl(""),
      Vp : new FormControl(""),
      Ufr : new FormControl(""),
      Tfr : new FormControl(""),
      Tmp : new FormControl(""),
      Dfr : new FormControl(""),
      Systolic : new FormControl(""),
      Diastolic : new FormControl(""),
      PulseRate : new FormControl(""),
      Replacement : new FormControl(""),
      FluidType : new FormControl(""),
      Medications : new FormControl(""),
      Comments :new FormControl(""),
    })
  }

  createAssessment() {
    console.log(this.haemomonitoring.value);
  }

}
