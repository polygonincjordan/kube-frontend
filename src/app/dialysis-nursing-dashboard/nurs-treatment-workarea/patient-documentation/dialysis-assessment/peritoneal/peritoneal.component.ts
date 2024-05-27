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
  peritonealForm: FormGroup<any>;
  subscription: Subscription;

  constructor(private sharedService: SharedService, private emergencyService: EmergencyService, protected patientDocService: PatientDocumentationService) {
    this.peritonealForm = this.patientDocService.dialysisAssecementForm.controls['peritonealForm']
    this.initializeFormData()

    if(this.subscription){
      this.subscription.unsubscribe();
    }

    this.subscription = this.patientDocService.formDataBehaviorSubject.subscribe((resp)=>{
      this.peritonealForm.patchValue(resp)
    })
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
      PdSmoke: '',
      PdPhone: '',
      PdFire: '',
      PdOther: '',
      PdOtherTxt: '',
      StIndoors: '',
      StOutdoors: '',
      StEnclosedWFloor: '',
      StEnclosedWoFloor: '',
      StAdequate: '',
      StInadequate: '',
      StAreaHeated: '',
      StOther: '',
      StOtherTxt: '',
      HoPlumbing: '',
      HoEnclosed: '',
      HoAdequate: '',
      HoCleanlinessAd: '',
      HoCleanlinessNeed: '',
      HoPetsInside: '',
      HoPetsOutside: '',
      HoAbsent: '',
      HoDoor: '',
      HoWindows: '',
      HoOther: '',
      HoOtherTxt: '',
      Tendency: null,
      PetsInside: '',
      TypePet: '',
      WaCity: '',
      WaWell: '',
      WaSpring: '',
      WaCistern: '',
      WaOther: '',
      WaOtherTxt: '',
      GaCity: '',
      GaSepticTank: '',
      GaGarbage: '',
      GaOther: '',
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
    this.subscription.unsubscribe();
  }
}
