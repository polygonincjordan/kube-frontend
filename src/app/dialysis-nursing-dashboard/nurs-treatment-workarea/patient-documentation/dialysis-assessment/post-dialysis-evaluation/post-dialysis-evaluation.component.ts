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
  constructor(private sharedService: SharedService, private emergencyService: EmergencyService, private patientDocService: PatientDocumentationService) {
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
          });
          
        }
      });
      this.patientDocService.isPatchValueForPostDialysis = false;
    }
   }

  ngOnInit(): void {

  }

  initializeFormData(){
    this.postDialysisMonitoring.patchValue({
      PTreatmentDate: new Date(),
      PTreatmentTime: new Date(),
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
}
