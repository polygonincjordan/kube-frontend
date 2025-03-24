import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { DataShareService } from '@services/data-share.service';
import { DayCaseDashboardService } from '@services/day-case.dashboard/day-case-dashboard.service';
import { ActionType } from '@services/interfaces/common.enum';
import { SharedService } from '@services/shared.service';
import { StorageService } from '@services/storage.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-modified-aldrete-document',
  templateUrl: './modified-aldrete-document.component.html',
  styleUrls: ['./modified-aldrete-document.component.scss']
})
export class ModifiedAldreteDocumentComponent implements OnInit {

  MorsefallForm: FormGroup<any>;

  consciousnessList = [
    {
      label: 'Fully awake',
      value: '2',
    },
    {
      label: 'Arousable to calling',
      value: '1',
    },
    {
      label: 'Not responding',
      value: '0',
    },
  ];

  respirationList = [
    {
      label: 'Apnea',
      value: '0',
    },
    {
      label: 'Dyspnea, shollow breathing',
      value: '1',
    },
    {
      label: 'Deep breath and cough',
      value: '0',
    },
  ];

  saturationList = [
    {
      label: '> 92% on room air',
      value: '2',
    },
    {
      label: '> 90% with some O2',
      value: '1',
    },
    {
      label: '< 90% even some O2',
      value: '0',
    },
  ];

  circulationList = [
    {
      label: '2 BP + 20 mmHg of baseline',
      value: '2',
    },
    {
      label: '1 BP + 20-50 mmHg of baseline',
      value: '1',
    },
    {
      label: '0 BP + 50 mmHg of baseline',
      value: '0',
    },
  ];

  activityList = [
    {
      label: '2 Move all 4 extremities',
      value: '2',
    },
    {
      label: '1 Move > 2 extremities',
      value: '1',
    },
    {
      label: '0 No movements',
      value: '0',
    },
  ];
  private subscription: Subscription;
  private actionTypeSubscription$: Subscription;
  docKey: any;
  paramsObject: any;
  userProfile: any;
  date: any
  time: any

  constructor(private formBuilder: FormBuilder, private storageService: StorageService, private _route: ActivatedRoute, private dayCaseDashboard: DayCaseDashboardService,
    private sharedService: SharedService, private dataShareService: DataShareService, private datePipe: DatePipe,) {
    this._route.queryParams.subscribe((params) => {
      this.paramsObject = params;
    });

    this.actionTypeSubscription$ = this.dataShareService.actionsType$.subscribe(
      (data) => {
        if (data != null) {
          if (data.type == ActionType.Add$ && data.value == '') {
            this.docKey = data.value.Dockey;
          }
          if (data.type == ActionType.Update$ && data.value) {
            this.docKey = data.value.docKey;
            this.getModifiedAldreteDocDetails(data.value.docKey);
          }
          if (data.type == ActionType.Copy$ && data.value) {
            this.docKey = data.value.docKey;
            this.getModifiedAldreteDocDetails(data.value.docKey);
          }
        }
      }
    );

    this.userProfile = this.storageService.getUserProfile();
  }

  ngOnInit(): void {
    let currentTime = this.datePipe.transform(new Date(), 'hh:mm:ss');
    this.initForm();
    this.date = new Date();
    this.time = currentTime;
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

  initForm() {
    this.MorsefallForm = this.formBuilder.group({
      Dockey: "",
      Dtid: "SCA_ALDRET",
      Einri: this.paramsObject.einri,
      Patnr: this.paramsObject.patnr,
      Falnr: this.paramsObject.falnr,
      Lfdnr: this.paramsObject.lfdnr,
      Orgdo: this.storageService?.patientData?.deptOrgUnit,
      AttendPhy: this.storageService.getUserProfile()?.Gpart,
      DocStatus: "",
      Consciousness: "",
      ConsciousnessScore: "",
      Respiration: "",
      RespirationScore: "",
      O2Saturation: "",
      O2SaturationScore: "",
      Circulation: "",
      CirculationScore: "",
      Activity: "",
      ActivityScore: "",
      TotalScore: "",
      TotalScoreDesc: "",
      Comments: ""
    })
  }

  getModifiedAldreteDocDetails(docKey?) {
    this.subscription = this.dayCaseDashboard
      .fetcModifiedAldreteSetDocDetails(docKey)
      .subscribe({
        next: (data: any) => {
          this.MorsefallForm.patchValue(data.d.results[0]);
        },
        error: (err: any) => {
          this.sharedService.waringSwallModel(`Error ${err}`);
          this.sharedService.waringSwallModel(
            `POST Error at Nursing discharge assessment: ${err}`
          );
        },
      });
  }

  totalScore() {
    let totalScore =
      (parseInt(this.MorsefallForm.value.ConsciousnessScore) || 0) +
      (parseInt(this.MorsefallForm.value.RespirationScore) || 0) +
      (parseInt(this.MorsefallForm.value.O2SaturationScore) || 0) +
      (parseInt(this.MorsefallForm.value.CirculationScore) || 0) +
      (parseInt(this.MorsefallForm.value.ActivityScore) || 0);
    this.MorsefallForm.patchValue({
      TotalScore: totalScore
    });
    this.MorsefallForm.patchValue({
      Consciousness: this.MorsefallForm.value.ConsciousnessScore,
      Respiration: this.MorsefallForm.value.RespirationScore,
      O2Saturation: this.MorsefallForm.value.O2SaturationScore,
      Circulation: this.MorsefallForm.value.CirculationScore,
      Activity: this.MorsefallForm.value.ActivityScore,
    });

    if (parseInt(this.MorsefallForm.value.TotalScore) < 9) {
      this.MorsefallForm.patchValue({
        TotalScoreDesc: 'Discharge criteria not met'
      });
    } else {
      this.MorsefallForm.patchValue({
        TotalScoreDesc: 'Discharge criteria met '
      });
    }
  }

  isFormValidError: boolean = false;
  createModifiedAldreteDocument(docStatus: any, actiontype?: string) {
    debugger
    return new Promise((resolve, reject) => {
      this.isFormValidError = true;
      if (this.MorsefallForm.invalid) {
        return;
      }
      this.MorsefallForm.value.DocStatus = docStatus;
      let paylaod = this.MorsefallForm.value;
      paylaod.TotalScore = paylaod.TotalScore.toString(); 
      paylaod.Orgdo = this.storageService?.patientData?.deptOrgUnit;
      this.subscription = this.dayCaseDashboard
        .saveModifiedAldreteDocument(paylaod)
        .subscribe({
          next: (data: any) => { },
          error: (err: any) => {
            this.sharedService.waringSwallModel(`Error ${err}`);
            this.sharedService.waringSwallModel(
              `PUT Error at Modified Aldrete document : ${err}`
            );
          },
          complete: () => {
            resolve(true);
            if (actiontype === 'edit') {
              this.sharedService.successSwallModel(
                'Modified Aldrete Score (MAS) document updated successfully'
              );
            } else {
              this.sharedService.successSwallModel(
                'Modified Aldrete Score (MAS) document created successfully'
              );
            }
          },
        });
    });
  }
}
