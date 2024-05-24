import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { EmergencyService } from '@services/emergency-dashboard/emergency-service';
import { PatientDocumentationService } from '@services/patient-documentation.service';
import { SharedService } from '@services/shared.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'haemodialysis-line-infection-surveillance',
  templateUrl: './haemodialysis-line-infection-surveillance.component.html',
  styleUrls: ['./haemodialysis-line-infection-surveillance.component.scss']
})
export class HaemodialysisLineInfectionSurveillanceComponent implements OnInit {
  isChecked: boolean = false;
  haemodialysisLineMonitoring: FormGroup<any>;
  private subscription: Subscription;
  no: any;

  constructor(private sharedService: SharedService, private emergencyService: EmergencyService, protected patientDocService: PatientDocumentationService) {
  this.haemodialysisLineMonitoring = this.patientDocService.dialysisAssecementForm.controls['haemodialysisLineMonitoring']

  }

  ngOnInit(): void {
  }

  toggleTextBox() {
    this.isChecked = !this.isChecked;
  }

  createAssessment() {
    console.log(this.haemodialysisLineMonitoring.value);
  }

}
