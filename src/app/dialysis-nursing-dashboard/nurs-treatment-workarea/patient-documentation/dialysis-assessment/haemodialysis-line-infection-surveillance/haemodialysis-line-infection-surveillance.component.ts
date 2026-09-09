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
  haemodialysisLineMonitoring:any;
  private subscription: Subscription;
  no: any;

  constructor(private sharedService: SharedService, private emergencyService: EmergencyService, protected patientDocService: PatientDocumentationService) {
    if(this.patientDocService.dialysisAssecementForm.controls['haemodialysisLineMonitoring']){
    this.haemodialysisLineMonitoring = this.patientDocService.dialysisAssecementForm.controls['haemodialysisLineMonitoring']

  }
  
  if(this.subscription){
    this.subscription.unsubscribe(); 
  }
  
  // this.haemodialysisLineMonitoring.get('Pus').valueChanges.subscribe(value => {
  //   if (value === 4) {
  //     this.haemodialysisLineMonitoring.get('PusScore').setValue(4);
  //   } else {
  //     this.haemodialysisLineMonitoring.get('PusScore').setValue('');
  //   }
  // });

  if(this.patientDocService.isPatchValueForHaemodialysisLineMonitoring){
    this.initializeFormData()
    
    this.subscription = this.patientDocService.formDataBehaviorSubject.subscribe((resp)=>{
      if(Object.keys(resp).length){        
        this.haemodialysisLineMonitoring.patchValue(resp);
      }
    })
    this.patientDocService.isPatchValueForHaemodialysisLineMonitoring = false;
  }
  }

  initializeFormData(){
    this.haemodialysisLineMonitoring.patchValue({
      HaemodialysisLine: '',
      OtherTxt: '',
      Redness: '1',
      RednessScore: '',
      Swelling: '1',
      SwellingScore: '',
      Exuade: '1',
      ExuadeScore: '',
      Pus: '1',
      PusScore: '',
      TotalScore: '',
      Plann: '',
    })
  }

  ngOnInit(): void {
  }

  toggleTextBox() {
    this.isChecked = !this.isChecked;
  }
  
  ngOnDestroy(): void {
    if(this.subscription){
      this.subscription.unsubscribe()
    }
  }

}
