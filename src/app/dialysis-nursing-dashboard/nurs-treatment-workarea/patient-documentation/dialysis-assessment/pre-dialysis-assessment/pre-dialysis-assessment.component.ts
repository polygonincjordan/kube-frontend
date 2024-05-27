import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { EmergencyService } from '@services/emergency-dashboard/emergency-service';
import { PatientDocumentationService } from '@services/patient-documentation.service';
import { SharedService } from '@services/shared.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'pre-dialysis-assessment',
  templateUrl: './pre-dialysis-assessment.component.html',
  styleUrls: ['./pre-dialysis-assessment.component.scss']
})
export class PreDialysisAssessmentComponent implements OnInit {
  predialysis: FormGroup<any>;
  private subscription: Subscription;

  constructor(private sharedService: SharedService, private emergencyService: EmergencyService, private patientDocService: PatientDocumentationService) {
    this.predialysis = this.patientDocService.dialysisAssecementForm.controls['preDialysis'];
    this.initializeFormData()

    if(this.subscription){
      this.subscription.unsubscribe();
    }

    this.subscription =
      this.patientDocService.formDataBehaviorSubject.subscribe((resp) => {
        this.predialysis.patchValue({
          ...resp,
          TreatmentDate: this.patientDocService.formatDate(resp.TreatmentDate),
          DialysisFDate: this.patientDocService.formatDate(resp.DialysisFDate),
        });
      });
  }

  ngOnInit(): void {

  }

  initializeFormData(){
    const date = new Date();
    date.setMinutes(0);
    date.setSeconds(0);
    this.predialysis.patchValue({
      TreatmentDate: new Date(),
      TreatmentTime: new Date(),
      DialysisFDate: new Date(),
      DialysisFTime: new Date(),
      BloodTest: null,
      PrescribedTime: date,
      DryWeight: '',
      Machine: '',
      BloodFlow: '',
      PostWeight: '',
      Treatment: '',
      TypeDialyzer: null,
      NewDryWeight: '',
      Height: '',
      WeightLoss: '',
      PreWeight: '',
      OxygenSaturation: '',
      OxygenFlow: '',
      OxygenDelivery: null,
      OralTemp: '',
      AxillaryTemp: '',
      PulseRate: '',
      RespiratoryRate: '',
      SystolicBloodSitting: '',
      DiastolicBloodSitting: '',
      ArterialPressure: '',
      SystolicBloodStanding: '',
      DiastolicBloodStanding: '',
    })
  }


  createAssessment() {
    console.log(this.predialysis.value);
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

}
