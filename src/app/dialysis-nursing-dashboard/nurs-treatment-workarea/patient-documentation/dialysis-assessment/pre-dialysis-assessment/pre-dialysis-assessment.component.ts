import { DatePipe } from '@angular/common';
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
  predialysis: any;
  private subscription: Subscription;

  constructor(private sharedService: SharedService, private emergencyService: EmergencyService, private patientDocService: PatientDocumentationService,private datePipe:DatePipe) {
    if(this.patientDocService.dialysisAssecementForm.controls['preDialysis']){
      this.predialysis = this.patientDocService.dialysisAssecementForm.controls['preDialysis'];
    }
    

    if(this.subscription){
      this.subscription.unsubscribe();
    }

    if(this.patientDocService.isPatchValueForPreDialysis){
      this.initializeFormData();

      this.subscription =
      this.patientDocService.formDataBehaviorSubject.subscribe((resp) => {
       
        if(Object.keys(resp).length > 0){
          this.predialysis.patchValue({
            ...resp,
            TreatmentDate: this.patientDocService.formatDate(resp.TreatmentDate),
            DialysisFDate: this.patientDocService.formatDate(resp.DialysisFDate),
            TreatmentTime:this.parseTime(resp.PTreatmentTime),
            DialysisFTime:this.parseTime(resp.DialysisFTime),
            PrescribedTime:this.parseTime(resp.PrescribedTime),
          });
        }
      });

      this.patientDocService.isPatchValueForPreDialysis = false;
    }
  }

  parseTime(data: string) {    
    if (data && data.length) {
      const strArr: string[] = data.split('');
      if (
        data &&
        data.length === 11 &&
        strArr[4] === 'H' &&
        strArr[7] === 'M' &&
        strArr[10] === 'S' &&
        !isNaN(+(strArr[2] + strArr[3])) &&
        !isNaN(+(strArr[5] + strArr[6])) &&
        !isNaN(+(strArr[8] + strArr[9]))
      ) {
        const hours =
          +(strArr[2] + strArr[3]) <= 9
            ? `0${+(strArr[2] + strArr[3])}`
            : +(strArr[2] + strArr[3]);
        const Minute =
          +(strArr[5] + strArr[6]) <= 9
            ? `0${+(strArr[5] + strArr[6])}`
            : +(strArr[5] + strArr[6]);
        const Second =
          +(strArr[8] + strArr[9]) <= 9
            ? `0${+(strArr[8] + strArr[9])}`
            : +(strArr[8] + strArr[9]);
        return `${hours}:${Minute}:${Second}`;
      }
    }
    return null;
  }

  ngOnInit(): void {

  }

  initializeFormData(){
    let currentTime = this.datePipe.transform(new Date(), 'hh:mm:ss');
    const date = new Date();
    date.setMinutes(0);
    date.setSeconds(0);
    this.predialysis.patchValue({
      TreatmentDate: new Date(),
      TreatmentTime: '',
      DialysisFDate: new Date(),
      DialysisFTime: currentTime,
      BloodTest: null,
      PrescribedTime: '',
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

  ngOnDestroy(): void {
    if(this.subscription){
      this.subscription.unsubscribe();
    }
  }

}
