import { Component, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { EmergencyService } from '@services/emergency-dashboard/emergency-service';
import { PatientDocumentationService } from '@services/patient-documentation.service';
import { SharedService } from '@services/shared.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'peritoneal',
  templateUrl: './peritoneal.component.html',
  styleUrls: ['./peritoneal.component.scss']
})
export class PeritonealComponent implements OnInit {
  isEnableSelection: boolean;
  peritonealForm: any;
  subscription: Subscription;

  constructor(private sharedService: SharedService, private emergencyService: EmergencyService, protected patientDocService: PatientDocumentationService) {
    if(this.patientDocService.dialysisAssecementForm.controls['peritonealForm']){
      this.peritonealForm = this.patientDocService.dialysisAssecementForm.controls['peritonealForm'] 

    }

    if(this.subscription){
      this.subscription.unsubscribe();
    }

    if(this.patientDocService.isPatchValueForPeritonial){
      this.initializeFormData();
      
      this.subscription = this.patientDocService.formDataBehaviorSubject.subscribe((resp)=>{
        if(Object.keys(resp).length > 0){
          this.peritonealForm.patchValue(resp);
        }
      })
      this.patientDocService.isPatchValueForPeritonial = false;
    }
  }

  ngOnInit(): void {
  }

  initializeFormData(){
    this.peritonealForm.patchValue({
      TypeDwelling: null,
      TypeDwellingTxt: '',
      AcCentral: false,
      AcWindowUnit: false,
      FanCeiling: false,
      FanStanding: false,
      FanWindow: false,
      HeatingElectric: false,
      HeatingGas: false,
      HeatingSolar: false,
      ChOther: false,
      ChOtherTxt: '',
      Community: null,
      Occupants: '',
      RoomShared: '',
      HomeHospital: '',
      PdSmoke: false,
      PdPhone: false,
      PdFire: false,
      PdOther: false,
      PdOtherTxt: '',
      StIndoors: false,
      StOutdoors: false,
      StEnclosedWFloor: false,
      StEnclosedWoFloor: false,
      StAdequate: false,
      StInadequate: false,
      StAreaHeated: false,
      StOther: false,
      StOtherTxt: '',
      HoPlumbing: false,
      HoEnclosed: false,
      HoAdequate: false,
      HoCleanlinessAd: false,
      HoCleanlinessNeed: false,
      HoPetsInside: false,
      HoPetsOutside: false,
      HoAbsent: false,
      HoDoor: false,
      HoWindows: false,
      HoOther: false,
      HoOtherTxt: '',
      Tendency: null,
      PetsInside: '',
      TypePet: '',
      WaCity: false,
      WaWell: false,
      WaSpring: false,
      WaCistern: false,
      WaOther: false,
      WaOtherTxt: '',
      GaCity: false,
      GaSepticTank: false,
      GaGarbage: false,
      GaOther: false,
      GaOtherTxt: '',
      Bathrooms: '',
      ShowerHead: '',
    })
  }


  onSelectionChange(event){
    if(event === '3'){
      this.isEnableSelection = true;
    }else{
      this.isEnableSelection = false;
      this.peritonealForm.get("TypeDwellingTxt").patchValue("")
    }
  }

  ngOnDestroy(): void {
    if(this.subscription){
      this.subscription.unsubscribe();
    }
  }
}
