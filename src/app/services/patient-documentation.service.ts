import { Injectable } from '@angular/core';
import { FormArray,  FormControl, FormGroup } from '@angular/forms';
import { HaemodialysisMonitoringComponent } from '../dialysis-nursing-dashboard/nurs-treatment-workarea/patient-documentation/dialysis-assessment/haemodialysis-monitoring/haemodialysis-monitoring.component';

@Injectable({
  providedIn: 'root'
})
export class PatientDocumentationService {
  isHaSOtherChecked:boolean;
  isHaAOtherChecked:boolean;
  isDiOtherChecked:boolean;
  isOtherHaemodialysisLine: boolean;

  dialysisAssecementForm = new FormGroup({
      Dockey : new FormControl(""),
      Dtid : new FormControl("ZMED_DIALY"),
      Einri : new FormControl("1000"),
      Patnr :new FormControl("1101"),
      Falnr : new FormControl("1402"),
      Lfdnr : new FormControl("00001"),
      Orgdo : new FormControl("F21IUAMC"),
      // hemodialysis-access
      HaSMonday:new FormControl(),
      HaSTuesday:new FormControl(),
      HaSWednesday:new FormControl(),
      HaSThursday:new FormControl(),
      HaSFriday:new FormControl(),
      HaSSaturday:new FormControl(),
      HaSSunday:new FormControl(),
      HaSOther:new FormControl(),
      HaSOtherTxt:new FormControl(),
      BloodDraw:new FormControl(),
      BloodDrawTxt: new FormControl(),
      HaAFistula:new FormControl(),
      HaAGraft:new FormControl(),
      HaACatheter:new FormControl(),
      HaATransLumbar:new FormControl(),
      HaAPd:new FormControl(),
      HaAOther:new FormControl(),
      HaAOtherTxt:new FormControl(),
      FistulaLocation:new FormControl(),
      AvRightForearm:new FormControl(),
      AvRightUpperarm:new FormControl(),
      AvRightAnterior:new FormControl(),
      AvRightThigh:new FormControl(),
      AvRightLower:new FormControl(),
      AvLeftForearm:new FormControl(),
      AvLeftUpperarm:new FormControl(),
      AvLeftAnterior:new FormControl(),
      AvLeftThigh :new FormControl(),
      AvLeftLower :new FormControl(),
      DiSubclavianLeft : new FormControl(),
      DiSubclavianRight : new FormControl(),
      DiInternalLeft : new FormControl(),
      DiInternalRight : new FormControl(),
      DiFemoralLeft : new FormControl(),
      DiFemoralRight :new FormControl(),
      DiTransLumbar : new FormControl(),
      DiOther : new FormControl(),
      DiOtherTxt : new FormControl(),
      FiBruising : new FormControl(),
      FiClotted : new FormControl(),
      FiAudible : new FormControl(),
      FiPalpable :new FormControl(),
      FiInflammed : new FormControl(),
      FiPatent : new FormControl(),
      FiNoAudible : new FormControl(),
      FiNoPalpable : new FormControl(),
      AvAudibleBruit : new FormControl(),
      AvPalpableThrill :new FormControl(),
      AvPatent : new FormControl(),
      AvNoAudible : new FormControl(),
      AvNoPalpable : new FormControl(),
      AvPulsePresent : new FormControl(),
      AvPulseAbsent :new FormControl(),
      DressingChanged : new FormControl(),

      // pre-dialysis assessment
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

      // Haemodialysis-line-monitoring
      HaemodialysisLine : new FormControl(),
      OtherTxt : new FormControl(),
      Redness : new FormControl(),
      RednessScore : new FormControl(),
      Swelling : new FormControl(),
      SwellingScore : new FormControl(),
      Exuade : new FormControl(),
      ExuadeScore : new FormControl(),
      Pus : new FormControl(),
      PusScore : new FormControl(),
      TotalScore : new FormControl(),
      Plann: new FormControl(),

      // Haemodialysis-Monitoring
      ChronicDone:new FormControl(),
      AcuteDone:new FormControl(),
      InternationalDone:new FormControl(),

      // post-dialysis-monitoring
      PTreatmentDate : new FormControl(),
      PTreatmentTime : new FormControl(),
      PPostWeight: new FormControl(),
      PAxillaryTemp : new FormControl(),
      POralTemp : new FormControl(),
      PPulseRate : new FormControl(),
      PRespiratoryRate : new FormControl(),
      POxygenSaturation  :new FormControl(),
      POxygenFlow : new FormControl(),
      POxygenDelivery : new FormControl(),
      PSystolicBloodSitting :new FormControl(),
      PDiastolicBloodSitting : new FormControl(),
      PArterialPressure : new FormControl(),
      PSystolicBloodStanding : new FormControl(),
      PDiastolicBloodStanding : new FormControl(),
      PBvp : new FormControl(),
      PKt : new FormControl(),
      PDialyserClearance : new FormControl(),
      PHypotension : new FormControl(),

      // tomonitor line

      TOMONITOR: new FormArray([])
})

  constructor() {
   }




  checkChange(event:Event){
  const {name,checked} = event.target as HTMLInputElement;

  debugger
  if(name === "HaSOther"){
    this.isHaSOtherChecked = checked;
    if(!checked){
      this.dialysisAssecementForm.get("HaSOtherTxt").patchValue("")
    }
  }else if(name === "HaAOther"){
    this.isHaAOtherChecked = checked;
    if(!checked){
      this.dialysisAssecementForm.get("HaAOtherTxt").patchValue("")
    }
  }else if(name === "DiOther"){
    this.isDiOtherChecked = checked;
    if(!checked){
      this.dialysisAssecementForm.get("DiOtherTxt").patchValue("")
    }
  }
}

radioSelectionChange(event:Event){
  // console.log(event);
  const {name,value} = event.target as HTMLInputElement
  console.log(name,value);

  if(name === 'Redness'){
    if(value === "yes"){
      this.dialysisAssecementForm.get('RednessScore').patchValue(1)
    }else{
      this.dialysisAssecementForm.get('RednessScore').patchValue(0)
    }
  }else if(name === "Swelling"){
    if(value === "yes"){
      this.dialysisAssecementForm.get('SwellingScore').patchValue(1)
    }else{
      this.dialysisAssecementForm.get('SwellingScore').patchValue(0)
    }
  }else if(name === "Exuade"){
    if(value === "yes"){
      this.dialysisAssecementForm.get('ExuadeScore').patchValue(2)
    }else{
      this.dialysisAssecementForm.get('ExuadeScore').patchValue(0)
    }
  }else if(name === "Pus"){
    if(value === "yes"){
      this.dialysisAssecementForm.get('PusScore').patchValue(4)
    }else{
      this.dialysisAssecementForm.get('PusScore').patchValue(0)
    }
  }else if(name === "HaemodialysisLine"){
    this.dialysisAssecementForm.get('OtherTxt').patchValue("")
  }

  if(name !== "HaemodialysisLine"){
    this.setTotal()
  }
}

setTotal(){
  const total = Number(this.dialysisAssecementForm.get('RednessScore').value) + Number(this.dialysisAssecementForm.get('SwellingScore').value) + Number(this.dialysisAssecementForm.get('ExuadeScore').value) + Number(this.dialysisAssecementForm.get('PusScore').value);

  let plann;

  if(total === 0 || total === 1){
    plann = 'Exit Site infection likely';
  }else if(total === 2 || total === 3){
    plann = 'Exit site may be inflamed & at risk of infection. Continue to observe. Consider a review of current exit care plan.';
  }else if(total >= 4){
    plann = 'Exit site infection likely – Swab Site and consider empiric antibiotic X 2 weeks. Review swab report in 48 hours & modify antibiotic therapy accordingly.';
  }

  this.dialysisAssecementForm.get('TotalScore').patchValue(total);
  this.dialysisAssecementForm.get('Plann').patchValue(plann);
}

}
