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
  selector: 'app-pediatric-early-warning',
  templateUrl: './pediatric-early-warning.component.html',
  styleUrls: ['./pediatric-early-warning.component.scss']
})
export class PediatricEarlyWarningComponent implements OnInit {
  paramsObject: any;
  pediatricFrom:FormGroup
  apiJson: { Einri: string; Falnr: string; Patnr: string; Lfdnr: string; Lfdbw: string; };
  behaviour: string;
  cardio: string;
  respiratory: string;
  behaviourArr = []
  cardioArr = []
  respiratoryArr =[]
  score2Every = 0
  score2Persistent  = 0
  totalScore = 0
  currDate =  new Date()
  currentTime: string;
  attendPhy: any = this.storageService.getUserProfile().Gpart;
  userName: any = this.storageService.getUserProfile().UserName;
  docKey:any

  constructor( private formBuilder: FormBuilder, private route: ActivatedRoute,private storageService: StorageService,private emergencyService: EmergencyService,private dataShareService: DataShareService,private sharedService: SharedService) { 
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
        this.getPediaTricWarningScore(data.value.docKey)
          }
          if (data.type == ActionType.Copy$  && data.value) {
             this.docKey = data.value.docKey
             this.getPediaTricWarningScore(data.value.docKey)
          }
        } else if (data.type == ActionType.Copy$  && data.value) {          
           this.docKey = data.value.docKey
           this.getPediaTricWarningScore(data.value.docKey)
        } else {
        // for after code
        }
      })

    const now = new Date();
    const hours = this.padZero(now.getHours());
    const minutes = this.padZero(now.getMinutes());
    this.currentTime = `${hours}:${minutes}`;
    console.log(' this.storageService.getUserProfile()', this.storageService.getUserProfile());
    
  }

  padZero(value: number): string {
    return value < 10 ? '0' + value : value.toString();
  }

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

  ngOnInit(): void {
    this.formInit()
  }

  formInit(data?:any){
    this.pediatricFrom = this.formBuilder.group({
      bpain: data ? data.BPain : false,
      bLethargic: data ? data.BLethargic : false,
      bConfused: data ? data.BConfused : false,
      bDifficultConsole: data ? data.BDifficultConsole : false,
      bConsolable: data ? data.BConsolable : false,
      bPlaying: data ? data.BPlaying : false,
      bAlert: data ? data.BAlert : false,
      bSleeping: data ? data.BSleeping : false,
      cBradycardia: data ? data.CBradycardia : false,
      cGreyMottled: data ? data.CGreyMottled : false,
      cCapillary5: data ? data.CCapillary5 : false, 
      cTachycardia30: data ? data.CTachycardia30 : false,
      cGreyCyanotic: data ? data.CGreyCyanotic : false,
      cCapillary4: data ? data.CCapillary4 : false,
      cTachycardia20: data ? data.CTachycardia20 : false,
      cPaleDusky: data ? data.CPaleDusky : false,
      cCapillary3: data ? data.CCapillary3 : false,
      cTachycardia10: data ? data.CTachycardia10 : false,
      cPink: data ? data.CPink : false,
      cCapillary1: data ? data.CCapillary1 : false,
      r50: data ? data.R50 : false,
      rRrGe5: data ? data.RRrGe5 : false,
      rSevere: data ? data.RSevere : false,
      rGrunting: data ? data.RGrunting : false,
      rAudible: data ? data.RAudible : false,
      r40: data ? data.R40 : false,
      rRr20: data ? data.RRr20 : false,
      rModerate: data ? data.RModerate : false,
      rWheeze: data ? data.RWheeze : false,
      r30: data ? data.R30 : false,
      rRr10 : data ? data.RRr10 : false,
      rMild: data ? data.RMild : false,
      rEndExpiratory: data ? data.REndExpiratory : false,
      rRateNormal: data ? data.RRateNormal : false,
      rNoRetractions: data ? data.RNoRetractions : false,
      rClearBreath: data ? data.RClearBreath : false,
      scoreEvery15: data ? data.ScoreEvery15 : false,
      scorePersistent: data ? data.ScorePersistent : false,
      nrsComments: data ? data.NrsComments : '',
      totalScore:0,
      desc:'No action needed, reassess as per order.'
    })
  }

 
  handelCheck(event,status,value){
    if(event.target.checked === true){
      if(status === 'behaviour'){
        this.behaviourArr.push(value)
      }
      if(status === 'cardio'){
        this.cardioArr.push(value)
      }
      if(status === 'respiratory'){
        this.respiratoryArr.push(value)
      }
      if(status === '15minscore'){
        this.score2Every = value
      }
      if(status === 'persistentScore'){
        this.score2Persistent = value
      }
      
    }
    if(event.target.checked === false){
      if(status === 'behaviour'){
        let index = this.behaviourArr.indexOf(value);
        if (index !== -1) {
          this.behaviourArr.splice(index, 1);
        }
      }
      if(status === 'cardio'){
        let index = this.cardioArr.indexOf(value);
        if (index !== -1) {
          this.cardioArr.splice(index, 1);
        }
      }
      if(status === 'respiratory'){
        let index = this.respiratoryArr.indexOf(value);
        if (index !== -1) {
          this.respiratoryArr.splice(index, 1);
        }
      }
      if(status === '15minscore'){
        this.score2Every = 0
      }
      if(status === 'persistentScore'){
        this.score2Persistent = 0
      }
    }
    let uniqueArrayBehaviour = Array.from(new Set(this.behaviourArr));
    let uniqueArrayCardio = Array.from(new Set(this.cardioArr));
    let uniqueArrayRespiratory = Array.from(new Set(this.respiratoryArr));

    let sumOfBehavior = uniqueArrayBehaviour.reduce((acc, currentValue) => acc + currentValue, 0);
    let sumOfCardio = uniqueArrayCardio.reduce((acc, currentValue) => acc + currentValue, 0);
    let sumOfRespiratory = uniqueArrayRespiratory.reduce((acc, currentValue) => acc + currentValue, 0);
    this.totalScore = sumOfBehavior + sumOfCardio + sumOfRespiratory + this.score2Every + this.score2Persistent
    this.pediatricFrom.patchValue({
      totalScore:this.totalScore
    })

  
    let description = ''
    switch (true) {
      case this.totalScore >= 0 && this.totalScore<=3:
        description = 'No action needed, reassess as per order.'
        
        break;
      case this.totalScore >= 4 && this.totalScore<=6:
        description = 'Notify Change Nurse, Call Junior Resident & notify Staff Physician.'
        
        break;
      case this.totalScore >= 7:
        description = 'Call the Rapid Response Team, call Staff Physician & Junior Resident.'
        
        break;
    
      default: description = 'No action needed, reassess as per order.'
        break;
    }
    this.pediatricFrom.patchValue({
      desc:description
    })

    
  }

  getPediaTricWarningScore(docKey?:any){
 
    this.subscription = this.emergencyService.getPediatricWarningScoreDetail(docKey).subscribe({
      next: (data: any) => {
        console.log('-===r=-e=-=-e=-=-=',data.d);
        this.formInit(data.d)
          
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

  savePediatricEarlyWarningScale(status?:any){

    return new Promise((resolve, reject) => {
    const Payload = 
      {
        d : {
          Dockey : this.docKey ? this.docKey : "",
          Einri : this.apiJson.Einri,
          Patnr : this.apiJson.Patnr,
          Falnr : this.apiJson.Falnr,
          Lfdnr : this.apiJson.Lfdnr,
          Orgdo : this.storageService.patientData.deptOrgUnit,
          BPain : this.pediatricFrom.value.bpain,
          BLethargic : this.pediatricFrom.value.bLethargic,
          BConfused : this.pediatricFrom.value.bConfused,
          BDifficultConsole : this.pediatricFrom.value.bDifficultConsole,
          BConsolable : this.pediatricFrom.value.bConsolable,
          BPlaying : this.pediatricFrom.value.bPlaying,
          BAlert : this.pediatricFrom.value.bAlert,
          BSleeping : this.pediatricFrom.value.bSleeping,
          CBradycardia : this.pediatricFrom.value.cBradycardia,
          CGreyMottled : this.pediatricFrom.value.cGreyMottled,
          CCapillary5 : this.pediatricFrom.value.cCapillary5,
          CTachycardia30 : this.pediatricFrom.value.cTachycardia30,
          CGreyCyanotic : this.pediatricFrom.value.cGreyCyanotic,
          CCapillary4 : this.pediatricFrom.value.cCapillary4,
          CTachycardia20 : this.pediatricFrom.value.cTachycardia20,
          CPaleDusky : this.pediatricFrom.value.cPaleDusky,
          CCapillary3 : this.pediatricFrom.value.cCapillary3,
          CTachycardia10 : this.pediatricFrom.value.cTachycardia10,
          CPink : this.pediatricFrom.value.cPink,
          CCapillary1 : this.pediatricFrom.value.cCapillary1,
          R50 : this.pediatricFrom.value.r50,
          RRrGe5 : this.pediatricFrom.value.rRrGe5,
          RSevere : this.pediatricFrom.value.rSevere,
          RGrunting : this.pediatricFrom.value.rGrunting,
          RAudible : this.pediatricFrom.value.rAudible,
          R40 : this.pediatricFrom.value.r40,
          RRr20 : this.pediatricFrom.value.rRr20,
          RModerate : this.pediatricFrom.value.rModerate,
          RWheeze : this.pediatricFrom.value.rWheeze,
          R30 : this.pediatricFrom.value.r30,
          RRr10 : this.pediatricFrom.value.rRr10,
          RMild : this.pediatricFrom.value.rMild,
          REndExpiratory : this.pediatricFrom.value.rEndExpiratory,
          RRateNormal : this.pediatricFrom.value.rRateNormal,
          RNoRetractions : this.pediatricFrom.value.rNoRetractions,
          RClearBreath : this.pediatricFrom.value.rClearBreath,
          ScoreEvery15 : this.pediatricFrom.value.scoreEvery15,
          ScorePersistent : this.pediatricFrom.value.scorePersistent,
          NrsComments : this.pediatricFrom.value.nrsComments,
          AttendPhy : this.storageService.getUserProfile().Gpart,
          DocStatus: status === 'copy' ?  "5" : '1'
        }
    }


    this.subscription = this.emergencyService.createPediatricWarninfScaletDetail(Payload).subscribe({
      next: (data: any) => {
  
      },
      error: (err: any) => {
        this.sharedService.waringSwallModel(`Error ${err}`);
        this.sharedService.waringSwallModel(`POST Error at Pediagtric Early Warning Score : ${err}`);
      },
      complete: () => {
        resolve(true); 
        this.sharedService.successSwallModel('Pediagtric Early Warning Score created successfully');
      }
    });

    })

  }
  copyPediatricEarlyWarningScale(status?:any){

    return new Promise((resolve, reject) => {
    const Payload = 
      {
        d : {
          Dockey : this.docKey ? this.docKey : "",
          Einri : this.apiJson.Einri,
          Patnr : this.apiJson.Patnr,
          Falnr : this.apiJson.Falnr,
          Lfdnr : this.apiJson.Lfdnr,
          Orgdo : this.storageService.patientData.deptOrgUnit,
          BPain : this.pediatricFrom.value.bpain,
          BLethargic : this.pediatricFrom.value.bLethargic,
          BConfused : this.pediatricFrom.value.bConfused,
          BDifficultConsole : this.pediatricFrom.value.bDifficultConsole,
          BConsolable : this.pediatricFrom.value.bConsolable,
          BPlaying : this.pediatricFrom.value.bPlaying,
          BAlert : this.pediatricFrom.value.bAlert,
          BSleeping : this.pediatricFrom.value.bSleeping,
          CBradycardia : this.pediatricFrom.value.cBradycardia,
          CGreyMottled : this.pediatricFrom.value.cGreyMottled,
          CCapillary5 : this.pediatricFrom.value.cCapillary5,
          CTachycardia30 : this.pediatricFrom.value.cTachycardia30,
          CGreyCyanotic : this.pediatricFrom.value.cGreyCyanotic,
          CCapillary4 : this.pediatricFrom.value.cCapillary4,
          CTachycardia20 : this.pediatricFrom.value.cTachycardia20,
          CPaleDusky : this.pediatricFrom.value.cPaleDusky,
          CCapillary3 : this.pediatricFrom.value.cCapillary3,
          CTachycardia10 : this.pediatricFrom.value.cTachycardia10,
          CPink : this.pediatricFrom.value.cPink,
          CCapillary1 : this.pediatricFrom.value.cCapillary1,
          R50 : this.pediatricFrom.value.r50,
          RRrGe5 : this.pediatricFrom.value.rRrGe5,
          RSevere : this.pediatricFrom.value.rSevere,
          RGrunting : this.pediatricFrom.value.rGrunting,
          RAudible : this.pediatricFrom.value.rAudible,
          R40 : this.pediatricFrom.value.r40,
          RRr20 : this.pediatricFrom.value.rRr20,
          RModerate : this.pediatricFrom.value.rModerate,
          RWheeze : this.pediatricFrom.value.rWheeze,
          R30 : this.pediatricFrom.value.r30,
          RRr10 : this.pediatricFrom.value.rRr10,
          RMild : this.pediatricFrom.value.rMild,
          REndExpiratory : this.pediatricFrom.value.rEndExpiratory,
          RRateNormal : this.pediatricFrom.value.rRateNormal,
          RNoRetractions : this.pediatricFrom.value.rNoRetractions,
          RClearBreath : this.pediatricFrom.value.rClearBreath,
          ScoreEvery15 : this.pediatricFrom.value.scoreEvery15,
          ScorePersistent : this.pediatricFrom.value.scorePersistent,
          NrsComments : this.pediatricFrom.value.nrsComments,
          AttendPhy : this.storageService.getUserProfile().Gpart,
          DocStatus: status === 'copy' ?  "3" : '1'
        }
    }


    this.subscription = this.emergencyService.copyPediatricWarningScore(Payload).subscribe({
      next: (data: any) => {
  
      },
      error: (err: any) => {
        this.sharedService.waringSwallModel(`Error ${err}`);
        this.sharedService.waringSwallModel(`POST Error at Pediagtric Early Warning Score : ${err}`);
      },
      complete: () => {
        resolve(true); 
        this.sharedService.successSwallModel('Pediagtric Early Warning Score copied successfully');
      }
    });

    })

  }

}
