import { DatePipe } from '@angular/common';
import { Component, EventEmitter, OnInit, Output, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { DataShareService } from '@services/data-share.service';
import { DayCaseDashboardService } from '@services/day-case.dashboard/day-case-dashboard.service';
import { ActionType } from '@services/interfaces/common.enum';
import { SharedService } from '@services/shared.service';
import { StorageService } from '@services/storage.service';
import { BsModalRef, BsModalService, ModalOptions } from 'ngx-bootstrap/modal';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-modified-aldrete-import-document',
  templateUrl: './modified-aldrete-document.component.html',
  styleUrls: ['./modified-aldrete-document.component.scss']
})
export class ModifiedAldreteDocumentForInportComponent implements OnInit {
  @ViewChild('aldreteScaleModalRef', { static: true }) aldreteScaleModalRef: TemplateRef<any>;
  @Output() aldreteScaleDoc = new EventEmitter<any>();

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
  dockeyValue: any;
  modalRef: BsModalRef;
  constructor(private formBuilder: FormBuilder, private storageService: StorageService, private _route: ActivatedRoute, private dayCaseDashboard: DayCaseDashboardService,
    private sharedService: SharedService, private dataShareService: DataShareService, private datePipe: DatePipe, private modalService: BsModalService,) {
    this._route.queryParams.subscribe((params) => {
      this.paramsObject = params;
    });

    this.userProfile = this.storageService.getUserProfile();
  }

  ngOnInit(): void {
    let currentTime = this.datePipe.transform(new Date(), 'hh:mm:ss');
    this.date = new Date();
    this.time = currentTime;
  }

  openModalForAldreteDocument(dockKey) {
    this.dockeyValue = null;
    this.dockeyValue = dockKey;
    const config: ModalOptions = {
      class: 'modal-dialog-centered modal-xl glasgow-scale-size',
      ignoreBackdropClick: true
    };
    this.modalRef = this.modalService.show(this.aldreteScaleModalRef, config);
    this.initForm();
    if (this.dockeyValue) {
      this.getModifiedAldreteDocDetails(dockKey);
    }
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
          this.MorsefallForm.disable();
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
          next: (data: any) => {
            let currentTime = this.datePipe.transform(new Date(), 'HH:mm:ss');
            let formValue = {
              totalScore: paylaod.TotalScore,
              description: paylaod.TotalScoreDesc,
              dockey: data?.d.Dockey,
              time: currentTime,
              date: new Date()
            }
            this.aldreteScaleDoc.next(formValue);
            this.modalRef?.hide()
          },
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

  closeGlosgowModel() {
    this.modalRef.hide();
  }
}
