import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { EmergencyService } from '@services/emergency-dashboard/emergency-service';
import { PatientDocumentationService } from '@services/patient-documentation.service';
import { SharedService } from '@services/shared.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'post-dialysis-evaluation',
  templateUrl: './post-dialysis-evaluation.component.html',
  styleUrls: ['./post-dialysis-evaluation.component.scss']
})
export class PostDialysisEvaluationComponent implements OnInit {
  private subscription: Subscription;
  postDialysisMonitoring: FormGroup<any>;
  constructor(private sharedService: SharedService, private emergencyService: EmergencyService, private patientDocService: PatientDocumentationService,private datePipe: DatePipe) {
    this.postDialysisMonitoring = this.patientDocService.dialysisAssecementForm.controls['postDialysisMonitoring'];

    if(this.subscription){
      this.subscription.unsubscribe();
    }

    if(this.patientDocService.isPatchValueForPostDialysis){
      this.initializeFormData();

      this.subscription =
      this.patientDocService.formDataBehaviorSubject.subscribe((resp) => {
        if(Object.keys(resp).length > 0){
          this.postDialysisMonitoring.patchValue({
            ...resp,
            PTreatmentDate: this.patientDocService.formatDate(resp.PTreatmentDate),
            PTreatmentTime: this.parseTime(resp.PTreatmentTime)
          });
          
        }
      });
      this.patientDocService.isPatchValueForPostDialysis = false;
    }
   }

  ngOnInit(): void {

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

  initializeFormData(){
    let currentTime = this.datePipe.transform(new Date(), 'hh:mm:ss');
    this.postDialysisMonitoring.patchValue({
      PTreatmentDate: new Date(),
      PTreatmentTime: currentTime,
      PPostWeight: '',
      PAxillaryTemp: '',
      POralTemp: '',
      PPulseRate: '',
      PRespiratoryRate: '',
      POxygenSaturation: '',
      POxygenFlow: '',
      POxygenDelivery: null,
      PSystolicBloodSitting: null,
      PDiastolicBloodSitting: '',
      PArterialPressure: '',
      PSystolicBloodStanding: '',
      PDiastolicBloodStanding: '',
      PBvp: '',
      PKt: '',
      PDialyserClearance: null,
      PHypotension: null,
    })
  }

  ngOnDestroy(): void {
    if(this.subscription){
      this.subscription.unsubscribe();
    }
  }
  getSelectLableName(selectNo){
    switch (selectNo) {
      case '0':
        return 'Nasal Cannula'
        break;
        case '1':
        return 'Oxygen Face Mask'
        break;
        case '2':
        return 'Face Mask with O2'
        break;
        case '3':
        return 'Venturi Mask'
    }
  }
}
