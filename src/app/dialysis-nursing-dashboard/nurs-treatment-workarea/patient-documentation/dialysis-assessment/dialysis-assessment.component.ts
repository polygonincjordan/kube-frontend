import { Component, Input, OnInit, ViewChild } from '@angular/core';
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
import { FormArray, FormControl, FormGroup } from '@angular/forms';

@Component({
  selector: 'dialysis-assessment',
  templateUrl: './dialysis-assessment.component.html',
  styleUrls: ['./dialysis-assessment.component.scss'],
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

  latestDocData: any;

  patnr: any;
  einri: any;
  falnr: any;
  lfdnr: any;

  constructor(
    private dataShareService: DataShareService,
    private emergencyService: EmergencyService,
    private _route: ActivatedRoute,
    private patientDocService: PatientDocumentationService
  ) {
    // this.actionTypeSubscription$ = this.dataShareService.actionsType$.subscribe(
    //   (data) => {
    //     console.log('data',data);
        
    //     if (data != null) {
    //       if (
    //         data.type == ActionType.Update$ &&
    //         data.isAllow == true &&
    //         data.value
    //       ) {
    //         if (
    //           data.value.type == WordType.EditGGCS &&
    //           data.value.docKey != ''
    //         ) {
    //           this.dockeyValue = data.value.docKey ? data.value.docKey : null;
    //           if (this.dockeyValue) {
    //             // this.getFacePainDetail(data.value.docKey);
    //           }
    //         }
    //       }
    //       if (
    //         data.type == ActionType.Copy$ &&
    //         data.isAllow == true &&
    //         data.value
    //       ) {
    //         if (
    //           data.value.type == WordType.CopyFPS &&
    //           data.value.docKey != ''
    //         ) {
    //           this.dockeyValue = data.value.docKey ? data.value.docKey : null;
    //           if (this.dockeyValue) {
    //             // this.getFacePainDetail(data.value.docKey);
    //           }
    //         }
    //       }
    //     }
    //   }
    // );

    this._route.queryParams.subscribe((params) => {
      this.einri = params.einri;
      this.patnr = params.patnr;
      this.falnr = params.falnr;
      this.lfdnr = params.lfdnr;
    });
    this.actionTypeSubscription$ = this.dataShareService.actionsType$.subscribe((data) => {
      console.log('data',data);      
      if (data != null) {       
        if (data.type == ActionType.Add$ && data.isAllow == true ) {
          console.log('add');
          this.patientDocService.formDataBehaviorSubject.next([]);
          this.patientDocService.initialForm()
        }
        if (data.type == ActionType.Copy$ && data.isAllow == true && data.value) {
          this.latestDocData = data.value.docKey
          this.LatestDocSet();
        }
        if (data.type == ActionType.Update$ && data.isAllow == true && data.value) {
          this.latestDocData = data.value.docKey
          this.LatestDocSet();
        }
      }
    });
  }

  ngOnInit(): void {
    this.patientDocService.isPatchValueForHemodialysis = true;
    this.patientDocService.isPatchValueForHaemodialysisLineMonitoring = true;
    this.patientDocService.isPatchValueForHaemodialysisMonitoring = true;
    this.patientDocService.isPatchValueForPeritonial = true;
    this.patientDocService.isPatchValueForPostDialysis = true;
    this.patientDocService.isPatchValueForPreDialysis = true;

    
  }

  LatestDocSet() {
    const json = {
      Einri: this.einri,
      Patnr: this.patnr,
      Falnr: this.falnr,
      Lfdnr: this.lfdnr,
    };
    this.emergencyService.getLatestDocSet(json).subscribe(
      (data: any) => {
        this.latestDocData = data.d.results[0];
        this.DailysisSet();
      },
      (error) => {
        console.error(error);
      }
    );
  }
  // parsePayloadFormateTime(data: string) {
  //   if (data && data.length) {
  //     let hours = data.substring(2, 4);
  //     let minute = data.substring(5, 7);

  //     return `${hours}:${minute}:AM`;
  //   }
  // }

  DailysisSet() {
    const json = {
      Dockey: this.latestDocData?.Dockey,
    };
    this.emergencyService.getDailysisSet(json).subscribe(
      (data: any) => {
        if (data.d.results[0]) {
          this.patientDocService.formDataBehaviorSubject.next(
            data.d.results[0]
          );

          const resp = data.d.results[0];          

          this.patientDocService.dialysisAssecementForm.controls[
            'preDialysis'
          ].patchValue({
            ...resp,
            TreatmentDate: this.patientDocService.formatDate(
              resp.TreatmentDate
            ),
            DialysisFDate: this.patientDocService.formatDate(
              resp.DialysisFDate
            ),
          });

          this.patientDocService.dialysisAssecementForm.controls['haemodialysisLineMonitoring'].patchValue(resp);
          
          this.patientDocService.dialysisAssecementForm.controls['haemodialysisMonitoring'].patchValue(resp);

          const TOMONITOR = resp?.TOMONITOR.results;

          TOMONITOR.forEach((item) => {
            const timee = item.Timee;
            const hours = timee.substring(2, 4);
            const minutes = timee.substring(5, 7);
            const seconds = timee.substring(8, 10);

            const date = new Date();
            date.setHours(hours);
            date.setMinutes(minutes);
            date.setSeconds(seconds);

            this.patientDocService.ToMonitor.push(this.patientDocService.createForm({ ...item, Timee: date }));
          });

          this.patientDocService.dialysisAssecementForm.controls['postDialysisMonitoring'].patchValue({
            ...resp,
            PTreatmentDate: this.patientDocService.formatDate(resp.PTreatmentDate),
          })

          this.patientDocService.dialysisAssecementForm.controls['peritonealForm'].patchValue(resp)
        }
      },
      (error) => {
        console.error(error);
      }
    );
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

  tabPanelNavigation(tabName: any) {
    if (tabName && tabName === 'haemodialysis') {
      this.Haemodialysis = true;
      this.PreDialysis = false;
      this.HaemodialysisLineInfectionSurveillance = false;
      this.HaemodialysisMonitoring = false;
      this.PostDialysisEvaluation = false;
      this.Peritoneal = false;
    } else if (tabName && tabName === 'preDialysis') {
      this.Haemodialysis = false;
      this.PreDialysis = true;
      this.HaemodialysisLineInfectionSurveillance = false;
      this.HaemodialysisMonitoring = false;
      this.PostDialysisEvaluation = false;
      this.Peritoneal = false;
    } else if (
      tabName &&
      tabName === 'haemodialysis-line-infection-surveillance'
    ) {
      this.Haemodialysis = false;
      this.PreDialysis = false;
      this.HaemodialysisLineInfectionSurveillance = true;
      this.HaemodialysisMonitoring = false;
      this.PostDialysisEvaluation = false;
      this.Peritoneal = false;
    } else if (tabName && tabName === 'haemodialysis-monitoring') {
      this.Haemodialysis = false;
      this.PreDialysis = false;
      this.HaemodialysisLineInfectionSurveillance = false;
      this.HaemodialysisMonitoring = true;
      this.PostDialysisEvaluation = false;
      this.Peritoneal = false;
    } else if (tabName && tabName === 'postdialysisevaluation') {
      this.Haemodialysis = false;
      this.PreDialysis = false;
      this.HaemodialysisLineInfectionSurveillance = false;
      this.HaemodialysisMonitoring = false;
      this.PostDialysisEvaluation = true;
      this.Peritoneal = false;
    } else if (tabName && tabName === 'peritoneal') {
      this.Haemodialysis = false;
      this.PreDialysis = false;
      this.HaemodialysisLineInfectionSurveillance = false;
      this.HaemodialysisMonitoring = false;
      this.PostDialysisEvaluation = false;
      this.Peritoneal = true;
    }
  }
}
