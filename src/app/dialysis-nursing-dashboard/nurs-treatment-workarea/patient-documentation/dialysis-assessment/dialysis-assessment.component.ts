import { Component, OnInit, ViewChild } from '@angular/core';
import { DataShareService } from '@services/data-share.service';
import { EmergencyService } from '@services/emergency-dashboard/emergency-service';
import { ActionType, WordType } from '@services/interfaces/common.enum';
import { SharedService } from '@services/shared.service';
import { Subscription } from 'rxjs';
import { HaemodialysisAccessComponent } from './haemodialysis-access/haemodialysis-access.component';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'dialysis-assessment',
  templateUrl: './dialysis-assessment.component.html',
  styleUrls: ['./dialysis-assessment.component.scss']
})
export class DialysisAssessmentComponent implements OnInit {
  private subscription: Subscription;
  public Haemodialysis: boolean = true;
  public PreDialysis: boolean = false;
  public HaemodialysisLineInfectionSurveillance: boolean = false;
  public HaemodialysisMonitoring: boolean = false;
  public dockeyValue: any = null;
  private actionTypeSubscription$: Subscription;
  @ViewChild(HaemodialysisAccessComponent) HaemodialysisAccess: HaemodialysisAccessComponent;
  patnr: any;
  einri: any;
  falnr: any;
  lfdnr: any;


  constructor( private dataShareService: DataShareService, private emergencyService: EmergencyService, private _route: ActivatedRoute,) {
     this.actionTypeSubscription$ = this.dataShareService.actionsType$.subscribe((data) => {
    if (data != null) {
      if (data.type == ActionType.Update$ && data.isAllow == true && data.value) {
        if (data.value.type == WordType.EditGGCS && data.value.docKey != '') {
          this.dockeyValue = data.value.docKey ? data.value.docKey : null;
          if (this.dockeyValue) {
            // this.getFacePainDetail(data.value.docKey);
          }
        }
      }
      if(data.type == ActionType.Copy$ && data.isAllow == true && data.value){
        if (data.value.type == WordType.CopyFPS && data.value.docKey != '') {
          this.dockeyValue = data.value.docKey ? data.value.docKey : null;
          if (this.dockeyValue) {
            // this.getFacePainDetail(data.value.docKey);
          }
        }
      }
    }
  });}

  ngOnInit(): void {
    this._route.queryParams.subscribe((params) => {
      this.einri = params.einri;
      this.patnr = params.patnr;
      this.falnr = params.falnr;
      this.lfdnr = params.lfdnr;
    });
    this.LatestDocSet();
    this.DailysisSet();
  }

  LatestDocSet() {
      const json = {
        // Einri: this.einri,
        // Patnr: this.patnr,
        // Falnr: this.falnr,
        // Lfdbw: this.lfdnr

        Einri: '1000',
        Patnr: '0000001101',
        Falnr: '0000001402',
        Lfdbw: '00001'
      };
      this.emergencyService.getLatestDocSet(json).subscribe((data: any) => {
          console.log(data);
        }, (error) => {
          console.error(error);
        });

  }

  DailysisSet(){
    const json = {
      Einri : "1000",
      Patnr : "1402",
      Falnr : "1101",
      Lfdnr : "00001",
      Dockey : "MED000000000000001000000079300000",
      Zversion : "00",
      AttendPhy : "9000000020",
      PhyNm : "Matar, Zaid",
      DocStatus : "2",
      StatusTxt : "Released",
      DocDate : "\/Date(1714608000000)\/",
      DocTime : "PT10H11M11S"
    };
    this.emergencyService.getDailysisSet(json).subscribe((data: any) =>{
      console.log(data);
    }, (error) => {
      console.error(error);
    });
  }



  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }

    if (this.actionTypeSubscription$) {
      this.actionTypeSubscription$.unsubscribe();
      this.dataShareService.sendActionType(null);
    }
  }

  tabPanelNavigation(tabName: any){
    if (tabName && tabName === 'haemodialysis') {
      this.Haemodialysis = true; this.PreDialysis = false; this.HaemodialysisLineInfectionSurveillance = false; this.HaemodialysisMonitoring = false;
    } else if (tabName && tabName === 'preDialysis') {
      this.Haemodialysis = false; this.PreDialysis = true; this.HaemodialysisLineInfectionSurveillance = false; this.HaemodialysisMonitoring = false;
    } else if (tabName && tabName === 'haemodialysis-line-infection-surveillance'){
      this.HaemodialysisLineInfectionSurveillance = true ; this.Haemodialysis = false; this.PreDialysis = false; this.HaemodialysisMonitoring = false;
    } else if (tabName && tabName === 'haemodialysis-monitoring'){
      this.HaemodialysisMonitoring = true ; this.Haemodialysis = false; this.PreDialysis = false; this.HaemodialysisLineInfectionSurveillance = false;
    }
  }

  createAssessment(): Promise<any> {
    return new Promise((resolve, reject) => {
    this.HaemodialysisAccess.createAssessment()
    });
  }
}
