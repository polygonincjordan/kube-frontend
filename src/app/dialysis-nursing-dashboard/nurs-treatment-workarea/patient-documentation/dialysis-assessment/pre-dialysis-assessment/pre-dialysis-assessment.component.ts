import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Subscription } from 'rxjs';

@Component({
  selector: 'pre-dialysis-assessment',
  templateUrl: './pre-dialysis-assessment.component.html',
  styleUrls: ['./pre-dialysis-assessment.component.scss']
})
export class PreDialysisAssessmentComponent implements OnInit {
  predialysis: FormGroup<any>;
  private subscription: Subscription;

  constructor() { }

  ngOnInit(): void {
    this.predialysis = new FormGroup({
      TreatmentDate : new FormControl(),
      TreatmentTime : new FormControl(),
      DialysisFDate: new FormControl(),
      DialysisFTime : new FormControl(),
      BloodTest : new FormControl(),
      PrescribedTime : new FormControl(),
      DryWeight : new FormControl(),
      Machine : new FormControl(),
      BloodFlow :new FormControl(),
      PostWeight : new FormControl(),
      Treatment : new FormControl(),
      TypeDialyzer : new FormControl(),
      NewDryWeight : new FormControl(),
      Height :new FormControl(),
      WeightLoss : new FormControl(),
      PreWeight: new FormControl(),
      OxygenSaturation : new FormControl(),
      OxygenFlow : new FormControl(),
      OxygenDelivery : new FormControl(),
      OralTemp : new FormControl(),
      AxillaryTemp : new FormControl(),
      PulseRate: new FormControl(),
      RespiratoryRate: new FormControl(),
      SystolicBloodSitting : new FormControl(),
      DiastolicBloodSitting: new FormControl(),
      ArterialPressure : new FormControl(),
      SystolicBloodStanding : new FormControl(),
      DiastolicBloodStanding : new FormControl(),
    });
  }

}
