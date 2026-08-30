import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { DataShareService } from '@services/data-share.service';
import { EmergencyService } from '@services/emergency-dashboard/emergency-service';
import { ActionType } from '@services/interfaces/common.enum';
import { SharedService } from '@services/shared.service';
import { StorageService } from '@services/storage.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-nurse-endorsement',
  templateUrl: './nurse-endorsement.component.html',
  styleUrls: ['./nurse-endorsement.component.scss']
})
export class NurseEndorsementComponent implements OnInit {

  public background: boolean = true;
  public assessment: boolean = false;
  public recommendations: boolean = false;
  paramsObject: any;
  apiJson: any;
  formDetailGroup: FormGroup;
  docKey:any
  nurseDataList:any
  seenBy = [
    {name:'Inpatient',value:'1'},
    {name:'Outpatient',value:'2'},
    {name:'Emergency',value:'3'}
  ]
  surgery=[
    {name:'Elective',value:'0'},
    {name:'Emergency',value:'1'},
  ]
 
presentCondition=[
  {name:'Elective',value:'0'},
  {name:'Emergency',value:'1'},
]

presenceOfFamily=[
  {name:'Yes',value:'0'},
  {name:'No',value:'1'},
]
verbleOrderList=[
  {name:'Yes',value:'0'},
  {name:'No',value:'1'},
  {name:'Not Applicable',value:'2'},
]

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }  
     if (this.actionTypeSubscription$) {
      this.actionTypeSubscription$.unsubscribe();
      this.dataShareService.sendActionType(null);
    }
  }
  private subscription: Subscription;
  private actionTypeSubscription$: Subscription;
  constructor( private formBuilder: FormBuilder, private route: ActivatedRoute, private storageService: StorageService,private emergencyService: EmergencyService,private sharedService: SharedService,private dataShareService: DataShareService,) { 
    this.route.queryParams.subscribe((params) => {
      this.paramsObject = params;
      this.storageService.setEinri(params['einri']);
      this.storageService.setFalnr(params['falnr']);
      this.storageService.setLfdnr(params['lfdnr']);
      this.storageService.setPatnr(params['patnr']);
    });
    this.apiJson = {
      Einri: this.storageService.einri,
      Falnr: this.storageService.falnr,
      Patnr: this.storageService.patnr,
      Lfdnr: this.storageService.lfdnr,
      Lfdbw: this.storageService.lfdnr
    }
    this.actionTypeSubscription$ = this.dataShareService.actionsType$.subscribe((data) => {      
      if (data != null) {
        if (data.type == ActionType.Add$ && data.value == '') {
          this.docKey = data.value.Dockey
        }
        if (data.type == ActionType.Update$  && data.value) {
        this.docKey = data.value.docKey
        this.getNurseDocDetail(data.value.docKey)
          }
          if (data.type == ActionType.Copy$  && data.value) {
             this.docKey = data.value.docKey
             this.getNurseDocDetail(data.value.docKey)
          }
        } else if (data.type == ActionType.Copy$  && data.value) {          
           this.docKey = data.value.docKey
           this.getNurseDocDetail(data.value.docKey)
        } else {
        // for after code
        }
      }
    

    
  )}

  ngOnInit(): void { 
    this.nurseEndForm()
    }

  nurseEndForm(data?:any) {
    
    this.formDetailGroup = this.formBuilder.group({
      seenBy : this.storageService.patientData.deptOrgUnitTxt === "EMERGENCY" ? '3' :'' ,
      presentCondition : data && data.PresentCondition ? data.PresentCondition :'' ,
      surgery : data && data.Surgery ? data.Surgery :''  ,
      presenceOfFamily : data && data.PresenceFamily ? data.PresenceFamily :''  ,
      insurance : data && data.Insurance ? data.Insurance : false ,
      contsente : data && data.Consent ? data.Consent : false ,
      cash : data && data.Cash ? data.Cash : false ,
      triageScore : data && data.TriageScore ? data.TriageScore : false  ,
      condition :  data && data.TriageScoreTxt ? data.TriageScoreTxt : ""  ,
      pastMedicalSurgicalHisDoc : data && data.PastMedical ? data.PastMedical : "" ,
      allergyDoc : data && data.Allergies ? data.Allergies : ""  ,
      VerbelOrder : data && data.VerbalOrders ? data.VerbalOrders : "" ,
      VerbelOrdertext : data && data.VerbalOrdersTxt ? data.VerbalOrdersTxt : "" ,
      presentMedicalSurgeryhisDoc :  data && data.PresentMedical ? data.PresentMedical : "" ,
      pastOrder : data && data.PastMedications ? data.PastMedications : "" ,
      presentMedication : data && data.PresentMedications ? data.PresentMedications : "" ,
     
      assessmentOptions: data && data?.Loc ? 'loc' : data?.Oriented ? 'oriented': data?.Confused ? 'confused' : data?.Sedated ? 'sedated' : '',
      vitalSigns :  data && data.VitalSigns ?  data.VitalSigns  : '' ,
      fallRiskScoreCheck : data && data.FallRisk ?  data.FallRisk  : false ,
      fallRiskScore : data && data.FallRiskTxt ?  data.FallRiskTxt  : '' ,
      painScaleScoreCheck : data && data.PainScale ?  data.PainScale  : false ,
      painScaleScore : data && data.PainScaleTxt ?  data.PainScaleTxt  : '' ,
      anyDefectsCheck : data && data.Defects ?  data.Defects  : false ,
      anyDefects : data && data.DefectsTxt ?  data.DefectsTxt  : '' ,
      skinIntegrityCheck : data && data.SkinIntegrity ?  data.SkinIntegrity  : false ,
      skinIntegrity : data && data.SkinIntegrityTxt ?  data.SkinIntegrityTxt  : '' ,
      habitsCheck : data && data.Habits ?  data.Habits  : false ,
      habits : data && data.HabitsTxt ?  data.HabitsTxt  : '' ,
      reviewOfSystems : data && data.Review ?  data.Review  : false ,
      lab : data && data.Lab ?  data.Lab  : false ,
      radiology : data && data.Radiology ?  data.Radiology  : false ,
      miscellaneous : data && data.Miscellaneous ?  data.Miscellaneous  : false ,
      drains : data && data.Drains ?  data.Drains  : false ,
      tubeFeeding : data && data.TubeFeeding ?  data.TubeFeeding  : false ,
      catheter : data && data.Catheter ?  data.Catheter  : false ,
      splint : data && data.Splint ?  data.Splint  : false ,
      needsHelpWithDressing : data && data.Dressing ?  data.Dressing  : false ,
      casts : data && data.Casts ?  data.Casts  : false ,
      specialNeeds : data && data.RSpecialNeeds ?  data.RSpecialNeeds  : false ,
      medications : data && data.RMedications ?  data.RMedications  : false ,
      ivFluids : data && data.RIvFluids ?  data.RIvFluids  : false ,
      plannedProcedures : data && data.RProcedures ?  data.RProcedures  : false ,
      rLab : data && data.RLab ?  data.RLab  : false ,
      dischargePlan : data && data.RDischargePlan ?  data.RDischargePlan  : false ,
      rMiscellaneous : data && data.RMiscellaneous ?  data.RMiscellaneous  : false ,
      rRadiology : data && data.RRadiology ?  data.RRadiology  : false ,
      dischargesSummary : data && data.RDischargeSummary ?  data.RDischargeSummary  : false ,
      Immunizations : data && data.RImmunizations ?  data.RImmunizations  : false ,
      appointmentsReferrals : data && data.RAppointments ?  data.RAppointments  : false ,
      transfer : data && data.RTransfer ?  data.RTransfer  : false ,
      education : data && data.REducation ?  data.REducation  : false ,
      approvalFollowUp : data && data.RApprovalFollowup ?  data.RApprovalFollowup  : false ,
      handedOverBy : data && data.RHandedOverBy ?  data.RHandedOverBy  : '' ,
      handedOverTo : data && data.RHandedOverTo ?  data.RHandedOverTo  : '' ,
      comments : data && data.RComments ?  data.RComments  : '' ,
    });
  }

  saveNurseEnd(btnStatus:any): Promise<any> {
    return new Promise((resolve, reject) => {

   const Payload ={
  d : {
    Dockey : "",
    Dtid : "ZMED_NREND",
    Einri : this.apiJson.Einri,
    Patnr : this.apiJson.Patnr,
    Falnr :this.apiJson.Falnr,
    Lfdnr : this.apiJson.Lfdnr,
    Orgdo : this.storageService.patientData.deptOrgUnit,
    SeenBy : this.formDetailGroup.value.seenBy,
    PresentCondition : this.formDetailGroup.value.presentCondition,
    Surgery : this.formDetailGroup.value.surgery,
    PresenceFamily : this.formDetailGroup.value.presenceOfFamily,
    Insurance : this.formDetailGroup.value.insurance,
    Cash : this.formDetailGroup.value.cash,
    Consent : this.formDetailGroup.value.contsente,
    TriageScore : this.formDetailGroup.value.triageScore,
    TriageScoreTxt :this.formDetailGroup.value.condition,
    PastMedical : this.formDetailGroup.value.pastMedicalSurgicalHisDoc,
    PresentMedical : this.formDetailGroup.value.presentMedicalSurgeryhisDoc,
    Allergies : this.formDetailGroup.value.allergyDoc,
    VerbalOrders : this.formDetailGroup.value.VerbelOrder,
    VerbalOrdersTxt : this.formDetailGroup.value.VerbelOrdertext,
    PastMedications :  this.formDetailGroup.value.pastOrder,
    PresentMedications : this.formDetailGroup.value.presentMedication,
    Loc : this.formDetailGroup.value.assessmentOptions === 'loc' ? true : false,
    Oriented : this.formDetailGroup.value.assessmentOptions === 'oriented' ? true : false,
    Confused : this.formDetailGroup.value.assessmentOptions === 'confused' ? true : false,
    Sedated : this.formDetailGroup.value.assessmentOptions === 'sedated' ? true : false,
    VitalSigns : this.formDetailGroup.value.vitalSigns,
    FallRisk : this.formDetailGroup.value.fallRiskScoreCheck,
    FallRiskTxt : this.formDetailGroup.value.fallRiskScore,
    PainScale : this.formDetailGroup.value.painScaleScoreCheck,
    PainScaleTxt : this.formDetailGroup.value.painScaleScore,
    Defects : this.formDetailGroup.value.anyDefectsCheck,
    DefectsTxt : this.formDetailGroup.value.anyDefects,
    SkinIntegrity : this.formDetailGroup.value.skinIntegrityCheck,
    SkinIntegrityTxt :  this.formDetailGroup.value.skinIntegrity,
    Habits :  this.formDetailGroup.value.habitsCheck,
    HabitsTxt : this.formDetailGroup.value.habits,
    Review :  this.formDetailGroup.value.reviewOfSystems,
    Lab : this.formDetailGroup.value.lab,
    Radiology : this.formDetailGroup.value.radiology,
    Miscellaneous : this.formDetailGroup.value.miscellaneous,
    Drains : this.formDetailGroup.value.drains,
    TubeFeeding : this.formDetailGroup.value.tubeFeeding,
    Catheter : this.formDetailGroup.value.catheter,
    Dressing : this.formDetailGroup.value.needsHelpWithDressing,
    Splint : this.formDetailGroup.value.splint,
    Casts : this.formDetailGroup.value.casts,
    RSpecialNeeds : this.formDetailGroup.value.specialNeeds,
    RMedications : this.formDetailGroup.value.medications,
    RProcedures : this.formDetailGroup.value.plannedProcedures,
    RIvFluids : this.formDetailGroup.value.ivFluids,
    RLab : this.formDetailGroup.value.rLab,
    RDischargePlan : this.formDetailGroup.value.dischargePlan,
    RMiscellaneous : this.formDetailGroup.value.rMiscellaneous,
    RRadiology : this.formDetailGroup.value.rRadiology,
    RDischargeSummary : this.formDetailGroup.value.dischargesSummary,
    RImmunizations : this.formDetailGroup.value.Immunizations,
    RAppointments : this.formDetailGroup.value.appointmentsReferrals,
    REducation : this.formDetailGroup.value.education,
    RTransfer : this.formDetailGroup.value.transfer,
    RApprovalFollowup : this.formDetailGroup.value.approvalFollowUp,
    RHandedOverBy : this.formDetailGroup.value.handedOverBy,
    RHandedOverTo :  this.formDetailGroup.value.handedOverTo,
    RComments :  this.formDetailGroup.value.comments,
    AttendPhy : this.storageService.getUserProfile().Gpart,
    DocStatus : btnStatus ? btnStatus : "1"
      } 
    }


  this.subscription = this.emergencyService.createNurseEndorsementDetail(Payload).subscribe({
    next: (data: any) => {

    },
    error: (err: any) => {
      this.sharedService.waringSwallModel(`Error ${err}`);
      this.sharedService.waringSwallModel(`POST Error at Nurse Endorsment : ${err}`);
    },
    complete: () => {
      resolve(true); 
      this.sharedService.successSwallModel('Nurse Endorsment created successfully');
    }
  });
})
}

getNurseDocDetail(docKey?:any){
 
  this.subscription = this.emergencyService.getNurseEndDetail(docKey).subscribe({
    next: (data: any) => {
this.nurseDataList = data.d.results[0]
this.nurseEndForm(data.d.results[0])

    },
    error: (err: any) => {
      this.sharedService.waringSwallModel(`Error ${err}`);
      this.sharedService.waringSwallModel(`POST Error at Nurse Endorsment : ${err}`);
    },
    // complete: () => {
      
    //   this.sharedService.successSwallModel('Nurse Endorsment created successfully');
    // }
  });
}


editNurseEndDoc(status?:any){
  
  return new Promise((resolve, reject) => {
  const Payload ={
    d : {
      Dockey : this.docKey,
      Dtid : "ZMED_NREND",
      Einri : this.apiJson.Einri,
      Patnr : this.apiJson.Patnr,
      Falnr :this.apiJson.Falnr,
      Lfdnr : this.apiJson.Lfdnr,
      Orgdo : this.storageService.patientData.deptOrgUnit,
      SeenBy : this.formDetailGroup.value.seenBy,
      PresentCondition : this.formDetailGroup.value.presentCondition,
      Surgery : this.formDetailGroup.value.surgery,
      PresenceFamily : this.formDetailGroup.value.presenceOfFamily,
      Insurance : this.formDetailGroup.value.insurance,
      Cash : this.formDetailGroup.value.cash,
      Consent : this.formDetailGroup.value.contsente,
      TriageScore : this.formDetailGroup.value.triageScore,
      TriageScoreTxt :this.formDetailGroup.value.condition,
      PastMedical : this.formDetailGroup.value.pastMedicalSurgicalHisDoc,
      PresentMedical : this.formDetailGroup.value.presentMedicalSurgeryhisDoc,
      Allergies : this.formDetailGroup.value.allergyDoc,
      VerbalOrders : this.formDetailGroup.value.VerbelOrder,
      VerbalOrdersTxt : this.formDetailGroup.value.VerbelOrdertext,
      PastMedications :  this.formDetailGroup.value.pastOrder,
      PresentMedications : this.formDetailGroup.value.presentMedication,
      Loc : this.formDetailGroup.value.assessmentOptions === 'loc' ? true : false,
      Oriented : this.formDetailGroup.value.assessmentOptions === 'oriented' ? true : false,
      Confused : this.formDetailGroup.value.assessmentOptions === 'confused' ? true : false,
      Sedated : this.formDetailGroup.value.assessmentOptions === 'sedated' ? true : false,
      VitalSigns : this.formDetailGroup.value.vitalSigns,
      FallRisk : this.formDetailGroup.value.fallRiskScoreCheck,
      FallRiskTxt : this.formDetailGroup.value.fallRiskScore,
      PainScale : this.formDetailGroup.value.painScaleScoreCheck,
      PainScaleTxt : this.formDetailGroup.value.painScaleScore,
      Defects : this.formDetailGroup.value.anyDefectsCheck,
      DefectsTxt : this.formDetailGroup.value.anyDefects,
      SkinIntegrity : this.formDetailGroup.value.skinIntegrityCheck,
      SkinIntegrityTxt :  this.formDetailGroup.value.skinIntegrity,
      Habits :  this.formDetailGroup.value.habitsCheck,
      HabitsTxt : this.formDetailGroup.value.habits,
      Review :  this.formDetailGroup.value.reviewOfSystems,
      Lab : this.formDetailGroup.value.lab,
      Radiology : this.formDetailGroup.value.radiology,
      Miscellaneous : this.formDetailGroup.value.miscellaneous,
      Drains : this.formDetailGroup.value.drains,
      TubeFeeding : this.formDetailGroup.value.tubeFeeding,
      Catheter : this.formDetailGroup.value.catheter,
      Dressing : this.formDetailGroup.value.needsHelpWithDressing,
      Splint : this.formDetailGroup.value.splint,
      Casts : this.formDetailGroup.value.casts,
      RSpecialNeeds : this.formDetailGroup.value.specialNeeds,
      RMedications : this.formDetailGroup.value.medications,
      RProcedures : this.formDetailGroup.value.plannedProcedures,
      RIvFluids : this.formDetailGroup.value.ivFluids,
      RLab : this.formDetailGroup.value.rLab,
      RDischargePlan : this.formDetailGroup.value.dischargePlan,
      RMiscellaneous : this.formDetailGroup.value.rMiscellaneous,
      RRadiology : this.formDetailGroup.value.rRadiology,
      RDischargeSummary : this.formDetailGroup.value.dischargesSummary,
      RImmunizations : this.formDetailGroup.value.Immunizations,
      RAppointments : this.formDetailGroup.value.appointmentsReferrals,
      REducation : this.formDetailGroup.value.education,
      RTransfer : this.formDetailGroup.value.transfer,
      RApprovalFollowup : this.formDetailGroup.value.approvalFollowUp,
      RHandedOverBy : this.formDetailGroup.value.handedOverBy,
      RHandedOverTo :  this.formDetailGroup.value.handedOverTo,
      RComments :  this.formDetailGroup.value.comments,
      AttendPhy : this.storageService.getUserProfile().Gpart,
      DocStatus : status === 'realese' ? "2" :status === 'copy' ? "5" : "1" 
        } 
      }
      
  this.subscription = this.emergencyService.updateNurseEndDetail(Payload).subscribe({
    next: (data: any) => {
    },
    error: (err: any) => {
      this.sharedService.waringSwallModel(`Error ${err}`);
      this.sharedService.waringSwallModel(`PUT Error at Nurse Endorsment : ${err}`);
    },
    complete: () => {
      resolve(true);
      this.sharedService.successSwallModel('Nurse Endorsment updated successfully');
    }
  });

})
}

copyNurseEndDoc(){

}

  public switchTabs(tab) {
    if (tab == 'Background') {
      this.background = true;
      this.assessment = false;
      this.recommendations = false;
    } else if (tab == 'Assessment') {
      this.background = false;
      this.assessment = true;
      this.recommendations = false;
    } else if (tab == 'Recommendations') {
      this.background = false;
      this.assessment = false;
      this.recommendations = true;
    }
  }

}
