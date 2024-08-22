import { Injectable } from '@angular/core';
import { FormArray, FormControl, FormGroup } from '@angular/forms';
import { HaemodialysisMonitoringComponent } from '../dialysis-nursing-dashboard/nurs-treatment-workarea/patient-documentation/dialysis-assessment/haemodialysis-monitoring/haemodialysis-monitoring.component';
import { BehaviorSubject } from 'rxjs';
import { DatePipe } from '@angular/common';

@Injectable({
  providedIn: 'root',
})
export class PatientDocumentationService {
  isHaSOtherChecked: boolean;
  isHaAOtherChecked: boolean;
  isDiOtherChecked: boolean;
  isOtherHaemodialysisLine: boolean;
  isChOtherChecked: boolean;
  isPdOtherChecked: boolean;
  isStOtherChecked: boolean;
  isHoOtherChecked: boolean;
  isWaOtherChecked: boolean;
  isGaOtherChecked: boolean;
  formDataBehaviorSubject: BehaviorSubject<any> = new BehaviorSubject({});

  latestMorseFallScaleData: any;
  latestHemoCatheterData: any;
  latestHemoDialysisFistulaGraftData: any;

  isPatchValueForHemodialysis: boolean = true;
  isPatchValueForHaemodialysisLineMonitoring: boolean = true;
  isPatchValueForHaemodialysisMonitoring: boolean = true;
  isPatchValueForPeritonial: boolean = true;
  isPatchValueForPostDialysis: boolean = true;
  isPatchValueForPreDialysis: boolean = true;

  dialysisAssecementForm = new FormGroup({
    // hemodialysis-access
    hemodialysis: new FormGroup({
      HaSMonday: new FormControl(true),
      HaSTuesday: new FormControl(true),
      HaSWednesday: new FormControl(''),
      HaSThursday: new FormControl(''),
      HaSFriday: new FormControl(''),
      HaSSaturday: new FormControl(''),
      HaSSunday: new FormControl(''),
      HaSOther: new FormControl(''),
      HaSOtherTxt: new FormControl(''),
      BloodDraw: new FormControl(''),
      BloodDrawTxt: new FormControl(''),
      HaAFistula: new FormControl(''),
      HaAGraft: new FormControl(''),
      HaACatheter: new FormControl(''),
      HaATransLumbar: new FormControl(''),
      HaAPd: new FormControl(''),
      HaAOther: new FormControl(''),
      HaAOtherTxt: new FormControl(''),
      FistulaLocation: new FormControl(''),
      AvRightForearm: new FormControl(''),
      AvRightUpperarm: new FormControl(''),
      AvRightAnterior: new FormControl(''),
      AvRightThigh: new FormControl(''),
      AvRightLower: new FormControl(''),
      AvLeftForearm: new FormControl(''),
      AvLeftUpperarm: new FormControl(''),
      AvLeftAnterior: new FormControl(''),
      AvLeftThigh: new FormControl(''),
      AvLeftLower: new FormControl(''),
      DiSubclavianLeft: new FormControl(''),
      DiSubclavianRight: new FormControl(''),
      DiInternalLeft: new FormControl(''),
      DiInternalRight: new FormControl(''),
      DiFemoralLeft: new FormControl(''),
      DiFemoralRight: new FormControl(''),
      DiTransLumbar: new FormControl(''),
      DiOther: new FormControl(''),
      DiOtherTxt: new FormControl(''),
      FiBruising: new FormControl(''),
      FiClotted: new FormControl(''),
      FiAudible: new FormControl(''),
      FiPalpable: new FormControl(''),
      FiInflammed: new FormControl(''),
      FiPatent: new FormControl(''),
      FiNoAudible: new FormControl(''),
      FiNoPalpable: new FormControl(''),
      AvAudibleBruit: new FormControl(''),
      AvPalpableThrill: new FormControl(''),
      AvPatent: new FormControl(''),
      AvNoAudible: new FormControl(''),
      AvNoPalpable: new FormControl(''),
      AvPulsePresent: new FormControl(''),
      AvPulseAbsent: new FormControl(''),
      DressingChanged: new FormControl(''),
    }),
  
    // pre-dialysis assessment
    preDialysis: new FormGroup({
      TreatmentDate: new FormControl(),
      TreatmentTime: new FormControl(),
      DialysisFDate: new FormControl(),
      DialysisFTime: new FormControl(),
      BloodTest: new FormControl(''),
      PrescribedTime: new FormControl(),
      DryWeight: new FormControl(''),
      Machine: new FormControl(''),
      BloodFlow: new FormControl(''),
      PostWeight: new FormControl(''),
      Treatment: new FormControl(''),
      TypeDialyzer: new FormControl(''),
      NewDryWeight: new FormControl(''),
      Height: new FormControl(''),
      WeightLoss: new FormControl(''),
      PreWeight: new FormControl(''),
      OxygenSaturation: new FormControl(''),
      OxygenFlow: new FormControl(''),
      OxygenDelivery: new FormControl(''),
      OralTemp: new FormControl(''),
      AxillaryTemp: new FormControl(''),
      PulseRate: new FormControl(''),
      RespiratoryRate: new FormControl(''),
      SystolicBloodSitting: new FormControl(''),
      DiastolicBloodSitting: new FormControl(''),
      ArterialPressure: new FormControl(''),
      SystolicBloodStanding: new FormControl(''),
      DiastolicBloodStanding: new FormControl(''),
    }), 
  
    // Haemodialysis-line-monitoring
    haemodialysisLineMonitoring: new FormGroup({
      HaemodialysisLine: new FormControl(''),
      OtherTxt: new FormControl(''),
      Redness: new FormControl(''),
      RednessScore: new FormControl(''),
      Swelling: new FormControl(''),
      SwellingScore: new FormControl(''),
      Exuade: new FormControl(''),
      ExuadeScore: new FormControl(''),
      Pus: new FormControl(''),
      PusScore: new FormControl(''),
      TotalScore: new FormControl(''),
      Plann: new FormControl(''),
    }),

    // Haemodialysis-Monitoring
    haemodialysisMonitoring: new FormGroup({
      ChronicDone: new FormControl('0'),
      AcuteDone: new FormControl('0'),
      InternationalDone: new FormControl('0'),
    }),

    // post-dialysis-monitoring
    postDialysisMonitoring: new FormGroup({
      PTreatmentDate: new FormControl(),
      PTreatmentTime: new FormControl(),
      PPostWeight: new FormControl(''),
      PAxillaryTemp: new FormControl(''),
      POralTemp: new FormControl(''),
      PPulseRate: new FormControl(''),
      PRespiratoryRate: new FormControl(''),
      POxygenSaturation: new FormControl(''),
      POxygenFlow: new FormControl(''),
      POxygenDelivery: new FormControl(''),
      PSystolicBloodSitting: new FormControl(''),
      PDiastolicBloodSitting: new FormControl(''),
      PArterialPressure: new FormControl(''),
      PSystolicBloodStanding: new FormControl(''),
      PDiastolicBloodStanding: new FormControl(''),
      PBvp: new FormControl(''),
      PKt: new FormControl(''),
      PDialyserClearance: new FormControl(''),
      PHypotension: new FormControl(''),
    }),
  
    // tomonitor line
    TOMONITOR: new FormArray([]),

    // peritoneal form
    peritonealForm : new FormGroup({
      TypeDwelling: new FormControl(''),
      TypeDwellingTxt: new FormControl(''),
      AcCentral: new FormControl(''),
      AcWindowUnit: new FormControl(''),
      FanCeiling: new FormControl(''),
      FanStanding: new FormControl(''),
      FanWindow: new FormControl(''),
      HeatingElectric: new FormControl(''),
      HeatingGas: new FormControl(''),
      HeatingSolar: new FormControl(''),
      ChOther: new FormControl(''),
      ChOtherTxt: new FormControl(''),
      Community: new FormControl(''),
      Occupants: new FormControl(''),
      RoomShared: new FormControl(''),
      HomeHospital: new FormControl(''),
      PdSmoke: new FormControl(''),
      PdPhone: new FormControl(''),
      PdFire: new FormControl(''),
      PdOther: new FormControl(''),
      PdOtherTxt: new FormControl(''),
      StIndoors: new FormControl(''),
      StOutdoors: new FormControl(''),
      StEnclosedWFloor: new FormControl(''),
      StEnclosedWoFloor: new FormControl(''),
      StAdequate: new FormControl(''),
      StInadequate: new FormControl(''),
      StAreaHeated: new FormControl(''),
      StOther: new FormControl(''),
      StOtherTxt: new FormControl(''),
      HoPlumbing: new FormControl(''),
      HoEnclosed: new FormControl(''),
      HoAdequate: new FormControl(''),
      HoCleanlinessAd: new FormControl(''),
      HoCleanlinessNeed: new FormControl(''),
      HoPetsInside: new FormControl(''),
      HoPetsOutside: new FormControl(''),
      HoAbsent: new FormControl(''),
      HoDoor: new FormControl(''),
      HoWindows: new FormControl(''),
      HoOther: new FormControl(''),
      HoOtherTxt: new FormControl(''),
      Tendency: new FormControl(''),
      PetsInside: new FormControl(''),
      TypePet: new FormControl(''),
      WaCity: new FormControl(''),
      WaWell: new FormControl(''),
      WaSpring: new FormControl(''),
      WaCistern: new FormControl(''),
      WaOther: new FormControl(''),
      WaOtherTxt: new FormControl(''),
      GaCity: new FormControl(''),
      GaSepticTank: new FormControl(''),
      GaGarbage: new FormControl(''),
      GaOther: new FormControl(''),
      GaOtherTxt: new FormControl(''),
      Bathrooms: new FormControl(''),
      ShowerHead: new FormControl(''),
    }),

    otherDetails: new FormGroup({
      Dockey: new FormControl(''),
      Dtid: new FormControl('ZMED_DIALY'),
      Einri:new FormControl('1000'),
      Patnr:new FormControl('1101'),
      Falnr:new FormControl('1402'),
      Lfdnr:new FormControl('00001'),
      Orgdo:new FormControl('F21IUAMC'),
      AttendPhy:new FormControl('9000000020'),
      DocStatus:new FormControl('1'),
    })
  });

  constructor() {
  }

  get ToMonitor() {
    return this.dialysisAssecementForm.get('TOMONITOR') as FormArray;
  }

  createForm(item?){
    return new FormGroup({
      Dockey : new FormControl(''),
      Timee : new FormControl(item ? item.Timee : new Date()),
      Bfr : new FormControl(item ? item.Bfr : ''),
      Ap : new FormControl(item ? item.Ap : ''),
      Vp : new FormControl(item ? item.Vp : ''),
      Ufr : new FormControl(item ? item.Ufr : ''),
      Tfr : new FormControl(item ? item.Tfr : ''),
      Tmp : new FormControl(item ? item.Tmp : ''),
      Dfr : new FormControl(item ? item.Dfr : ''),
      Systolic : new FormControl(item ? item.Systolic : ''),
      Diastolic : new FormControl(item ? item.Diastolic : ''),
      PulseRate : new FormControl(item ? item.PulseRate : ''),
      Replacement : new FormControl(item ? item.Replacement : ''),
      FluidType : new FormControl(item ? item.FluidType : ''),
      Medications : new FormControl(item ? item.Medications : ''),
      Comments :new FormControl(item ? item.Comments : ''),
    })
  }

  formatDate(date: string) {
    if (typeof (date) === 'string') {
      if (date !== null) {
        const generatedDate = new DatePipe('en-US').transform(
          date.replace('/Date(', '').replace(')/', ''), 'yyyy-MM-dd'
        );
        return new Date(generatedDate);
      } else {
        return null
      }
    } else {
      return date
    }
  }

  checkChange(event: Event) {
    const { name, checked } = event.target as HTMLInputElement;

    if (name === 'HaSOther') {
      this.isHaSOtherChecked = checked;
      if (!checked) {
        this.dialysisAssecementForm.controls['hemodialysis'].get('HaSOtherTxt').patchValue('');
      }
    } else if (name === 'HaAOther') {
      this.isHaAOtherChecked = checked;
      if (!checked) {
        this.dialysisAssecementForm.controls['hemodialysis'].get('HaAOtherTxt').patchValue('');
      }
    } else if (name === 'DiOther') {
      this.isDiOtherChecked = checked;
      if (!checked) {
        this.dialysisAssecementForm.controls['hemodialysis'].get('DiOtherTxt').patchValue('');
      }
    }else if(name === 'ChOther'){
      this.isChOtherChecked = checked;
      if(!checked){
        this.dialysisAssecementForm.controls['peritonealForm'].get('ChOtherTxt').patchValue('');
      }
    }else if(name === 'PdOther'){
      this.isPdOtherChecked = checked;
      if(!checked){
        this.dialysisAssecementForm.controls['peritonealForm'].get('PdOtherTxt').patchValue('');
      }
    }else if(name === 'StOther'){
      this.isStOtherChecked = checked;
      if(!checked){
        this.dialysisAssecementForm.controls['peritonealForm'].get('StOtherTxt').patchValue('');
      }
    }else if(name === 'HoOther'){
      this.isHoOtherChecked = checked;
      if(!checked){
        this.dialysisAssecementForm.controls['peritonealForm'].get('HoOtherTxt').patchValue('');
      }
    }else if(name === 'WaOther'){
      this.isWaOtherChecked = checked;
      if(!checked){
        this.dialysisAssecementForm.controls['peritonealForm'].get('WaOtherTxt').patchValue('');
      }
    }else if(name === 'GaOther'){
      this.isGaOtherChecked = checked;
      if(!checked){
        this.dialysisAssecementForm.controls['peritonealForm'].get('GaOtherTxt').patchValue('');
      }
    }
  }

  radioSelectionChange(event: Event) {
    // console.log(event);
    const { name, value } = event.target as HTMLInputElement;
    console.log(name, value);

    if (name === 'Redness') {
      if (value === '0') {
        this.dialysisAssecementForm.controls['haemodialysisLineMonitoring'].get('RednessScore').patchValue('1');
      } else {
        this.dialysisAssecementForm.controls['haemodialysisLineMonitoring'].get('RednessScore').patchValue('0');
      }
    } else if (name === 'Swelling') {
      if (value === '0') {
        this.dialysisAssecementForm.controls['haemodialysisLineMonitoring'].get('SwellingScore').patchValue('1');
      } else {
        this.dialysisAssecementForm.controls['haemodialysisLineMonitoring'].get('SwellingScore').patchValue('0');
      }
    } else if (name === 'Exuade') {
      if (value === '0') {
        this.dialysisAssecementForm.controls['haemodialysisLineMonitoring'].get('ExuadeScore').patchValue('2');
      } else {
        this.dialysisAssecementForm.controls['haemodialysisLineMonitoring'].get('ExuadeScore').patchValue('0');
      }
    } else if (name === 'Pus') {
      if (value === '0') {
        this.dialysisAssecementForm.controls['haemodialysisLineMonitoring'].get('PusScore').patchValue('4');
      } else {
        this.dialysisAssecementForm.controls['haemodialysisLineMonitoring'].get('PusScore').patchValue('0');
      }
    } else if (name === 'HaemodialysisLine') {
      this.dialysisAssecementForm.controls['haemodialysisLineMonitoring'].get('OtherTxt').patchValue('');
    }

    if (name !== 'HaemodialysisLine') {
      this.setTotal();
    }
  }

  setTotal() {
    const total =
      Number(this.dialysisAssecementForm.controls['haemodialysisLineMonitoring'].get('RednessScore').value) +
      Number(this.dialysisAssecementForm.controls['haemodialysisLineMonitoring'].get('SwellingScore').value) +
      Number(this.dialysisAssecementForm.controls['haemodialysisLineMonitoring'].get('ExuadeScore').value) +
      Number(this.dialysisAssecementForm.controls['haemodialysisLineMonitoring'].get('PusScore').value);

    let plann;

    if (total === 1) {
      plann = 'Exit Site infection likely';
    } else if (total === 2 || total === 3) {
      plann =
        'Exit site may be inflamed & at risk of infection. Continue to observe. Consider a review of current exit care plan.';
    } else if (total >= 4) {
      plann =
        'Exit site infection likely – Swab Site and consider empiric antibiotic X 2 weeks. Review swab report in 48 hours & modify antibiotic therapy accordingly.';
    }

    this.dialysisAssecementForm.controls['haemodialysisLineMonitoring'].get('TotalScore').patchValue(total == 0 ? '' : total.toString());
    this.dialysisAssecementForm.controls['haemodialysisLineMonitoring'].get('Plann').patchValue(plann);
  }
}
