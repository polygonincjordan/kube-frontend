import { Component, OnInit, ViewChild } from '@angular/core';
import { DataShareService } from '@services/data-share.service';
import { EmergencyService } from '@services/emergency-dashboard/emergency-service';
import { ActionType, WordType } from '@services/interfaces/common.enum';
import { SharedService } from '@services/shared.service';
import { Subscription } from 'rxjs';
import { HaemodialysisAccessComponent } from './haemodialysis-access/haemodialysis-access.component';
import { ActivatedRoute } from '@angular/router';
import { HaemodialysisMonitoringComponent } from './haemodialysis-monitoring/haemodialysis-monitoring.component';
import { HaemodialysisLineInfectionSurveillanceComponent } from './haemodialysis-line-infection-surveillance/haemodialysis-line-infection-surveillance.component';
import { PostDialysisEvaluationComponent } from './post-dialysis-evaluation/post-dialysis-evaluation.component';
import { PreDialysisAssessmentComponent } from './pre-dialysis-assessment/pre-dialysis-assessment.component';
import { PatientDocumentationService } from '@services/patient-documentation.service';
import { PeritonealComponent } from './peritoneal/peritoneal.component';

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
  public PostDialysisEvaluation: boolean = false;
  public Peritoneal: boolean = false;

  public dockeyValue: any = null;
  private actionTypeSubscription$: Subscription;
  @ViewChild(HaemodialysisAccessComponent) HaemodialysisAccess: HaemodialysisAccessComponent;
  @ViewChild(HaemodialysisMonitoringComponent) HaemodialysisMonitoringC: HaemodialysisMonitoringComponent;
  @ViewChild(HaemodialysisLineInfectionSurveillanceComponent) HaemodialysisLineInfectionSurveillanceC: HaemodialysisMonitoringComponent;
  @ViewChild(PostDialysisEvaluationComponent) PostDialysisEvaluationC: PostDialysisEvaluationComponent;
  @ViewChild(PreDialysisAssessmentComponent) PreDialysisAssessmentC: PreDialysisAssessmentComponent;
  @ViewChild(PeritonealComponent) peritonealC: PeritonealComponent;



  patnr: any;
  einri: any;
  falnr: any;
  lfdnr: any;



  constructor( private dataShareService: DataShareService, private emergencyService: EmergencyService, private _route: ActivatedRoute, private patientDocService : PatientDocumentationService) {
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
        Einri: '1000',
        Patnr: '0000001101',
        Falnr: '0000001402',
        Lfdnr: '00001'
      };
      this.emergencyService.getLatestDocSet(json).subscribe((data: any) => {
          console.log(data);
        }, (error) => {
          console.error(error);
        });

  }

  DailysisSet(){
    const json = {
      Dockey : "MED000000000000001000002976100000",
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
      this.Haemodialysis = true; this.PreDialysis = false; this.HaemodialysisLineInfectionSurveillance = false; this.HaemodialysisMonitoring = false; this.PostDialysisEvaluation = false;this.Peritoneal = false;
    } else if (tabName && tabName === 'preDialysis') {
      this.Haemodialysis = false; this.PreDialysis = true; this.HaemodialysisLineInfectionSurveillance = false; this.HaemodialysisMonitoring = false; this.PostDialysisEvaluation = false;this.Peritoneal = false;
    } else if (tabName && tabName === 'haemodialysis-line-infection-surveillance'){
      this.Haemodialysis = false; this.PreDialysis = false; this.HaemodialysisLineInfectionSurveillance = true ; this.HaemodialysisMonitoring = false; this.PostDialysisEvaluation = false;this.Peritoneal = false;
    } else if (tabName && tabName === 'haemodialysis-monitoring'){
      this.Haemodialysis = false; this.PreDialysis = false; this.HaemodialysisLineInfectionSurveillance = false;this.HaemodialysisMonitoring = true ; this.PostDialysisEvaluation = false;this.Peritoneal = false;
    } else if (tabName && tabName === 'postdialysisevaluation'){
      this.Haemodialysis = false; this.PreDialysis = false; this.HaemodialysisLineInfectionSurveillance = false; this.HaemodialysisMonitoring = false;  this.PostDialysisEvaluation = true;this.Peritoneal = false;
    } else if (tabName && tabName === 'peritoneal'){
      this.Haemodialysis = false; this.PreDialysis = false; this.HaemodialysisLineInfectionSurveillance = false; this.HaemodialysisMonitoring = false;  this.PostDialysisEvaluation = false;this.Peritoneal = true;
    }
  }

  createAssessment():Promise<any>{
    return new Promise<any>((resolve, reject) => {
      resolve({
        ...this.HaemodialysisAccess.hemodialysis.value,
        ...this.HaemodialysisMonitoringC.haemodialysisMonitoring.value,
        ...this.HaemodialysisLineInfectionSurveillanceC.hemolineinfection.value,
        ...this.PostDialysisEvaluationC.postDialysisMonitoring.value,
        ...this.PreDialysisAssessmentC.predialysis.value
      })
    })

  }
}
