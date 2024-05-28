import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { EmergencyService } from '@services/emergency-dashboard/emergency-service';
import { PatientDocumentationService } from '@services/patient-documentation.service';
import { SharedService } from '@services/shared.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'haemodialysis-access',
  templateUrl: './haemodialysis-access.component.html',
  styleUrls: ['./haemodialysis-access.component.scss']
})
export class HaemodialysisAccessComponent implements OnInit {
hemodialysis: FormGroup<any>;
private subscription: Subscription;
isEnableSelection: boolean = false;

constructor(private sharedService: SharedService, private emergencyService: EmergencyService, public patientDocService: PatientDocumentationService) {
  this.hemodialysis = this.patientDocService.dialysisAssecementForm.controls['hemodialysis'];

  if(this.subscription){
    this.subscription.unsubscribe();
  }

  if(this.patientDocService.isPatchValueForHemodialysis){
    this.initializeFormData();

    this.subscription = this.patientDocService.formDataBehaviorSubject.subscribe((resp)=>{
      if(Object.keys(resp).length){
        this.hemodialysis.patchValue(resp);
      }
    })
    this.patientDocService.isPatchValueForHemodialysis = false;
  }
}

  initializeFormData(){
    this.hemodialysis.patchValue({
      HaSMonday: false,
      HaSTuesday: false,
      HaSWednesday: false,
      HaSThursday: false,
      HaSFriday: false,
      HaSSaturday: false,
      HaSSunday: false,
      HaSOther: false,
      HaSOtherTxt: '',
      BloodDraw: null,
      BloodDrawTxt: '',
      HaAFistula: false,
      HaAGraft: false,
      HaACatheter: false,
      HaATransLumbar: false,
      HaAPd: false,
      HaAOther: '',
      HaAOtherTxt: '',
      FistulaLocation: null,
      AvRightForearm: false,
      AvRightUpperarm: false,
      AvRightAnterior: false,
      AvRightThigh: false,
      AvRightLower: false,
      AvLeftForearm: false,
      AvLeftUpperarm: false,
      AvLeftAnterior: false,
      AvLeftThigh: false,
      AvLeftLower: false,
      DiSubclavianLeft: false,
      DiSubclavianRight: false,
      DiInternalLeft: false,
      DiInternalRight: false,
      DiFemoralLeft: false,
      DiFemoralRight: false,
      DiTransLumbar: false,
      DiOther: '',
      DiOtherTxt: '',
      FiBruising: false,
      FiClotted: false,
      FiAudible: false,
      FiPalpable: false,
      FiInflammed: false,
      FiPatent: false,
      FiNoAudible: false,
      FiNoPalpable: false,
      AvAudibleBruit: false,
      AvPalpableThrill: false,
      AvPatent: false,
      AvNoAudible: false,
      AvNoPalpable: false,
      AvPulsePresent: false,
      AvPulseAbsent: false,
      DressingChanged: null,
    })
  }

  ngOnInit(): void {
    this.patientDocService.isHaSOtherChecked = false;
    this.patientDocService.isHaAOtherChecked = false;
    this.patientDocService.isDiOtherChecked = false;
  }

  onSelectionChange(event){
    if(event === '0'){
      this.isEnableSelection = true;
    }else{
      this.isEnableSelection = false;
      this.hemodialysis.get("BloodDrawTxt").patchValue("")
    }
  }

  createAssessment() {
    console.log(this.hemodialysis.value);
  }

  ngOnDestroy(): void {
    if(this.subscription){
      this.subscription.unsubscribe()
    }
  }

}

