import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { DataShareService } from '@services/data-share.service';
import { DayCaseDashboardService } from '@services/day-case.dashboard/day-case-dashboard.service';
import { ActionType } from '@services/interfaces/common.enum';
import { SharedService } from '@services/shared.service';
import { StorageService } from '@services/storage.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-correspondence-document',
  templateUrl: './correspondence-document.component.html',
  styleUrls: ['./correspondence-document.component.scss']
})
export class CorrespondenceDocumentComponent implements OnInit {

  correspondForm: FormGroup;
  @Input() correspondence: any;

  paramsObject: any;
  docKey: any;
  private actionTypeSubscription$: Subscription;
  private subscription: Subscription;

  isFormValidError: boolean = false;

  constructor(private formBuilder: FormBuilder, private _route: ActivatedRoute, private storageService: StorageService,
    private dataShareService: DataShareService, private dayCaseDashboard: DayCaseDashboardService, private sharedService: SharedService) {
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
            this.getCorrespondenceDocDetails(data.value.docKey);
          }
          if (data.type == ActionType.Copy$ && data.value) {
            this.docKey = data.value.docKey;
            this.getCorrespondenceDocDetails(data.value.docKey);
          }
        }
      }
    );
  }

  ngOnInit(): void {
    this.initForm();
  }

  initForm() {
    this.correspondForm = this.formBuilder.group({
      Dockey: "",
      Dtid: "ZMED_CORES",
      Einri: this.paramsObject.einri,
      Patnr: this.paramsObject.patnr,
      Falnr: this.paramsObject.falnr,
      Lfdnr: this.paramsObject.lfdnr,
      Orgdo: this.storageService?.patientData?.deptOrgUnit,
      AttendPhy: this.storageService.getUserProfile()?.Gpart,
      DocStatus: "1",
      ChiefComplaint: ""
    })
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
  getCorrespondenceDocDetails(docKey?) {
    this.subscription = this.dayCaseDashboard
      .fetcCorrespondenceSetDocDetails(docKey)
      .subscribe({
        next: (data: any) => {
          this.correspondForm.patchValue({
            ChiefComplaint: data.d.results[0]?.ChiefComplaint,
            Dockey: data.d.results[0]?.Dockey,
            Orgdo: data.d.results[0]?.Orgdo,
            AttendPhy: data.d.results[0]?.AttendPhy,
          })
        },
        error: (err: any) => {
          this.sharedService.waringSwallModel(`Error ${err}`);
          this.sharedService.waringSwallModel(
            `POST Error at Nursing care plans: ${err}`
          );
        },
      });
  }

  createCorrespondenceDocument(docStatus: any, actiontype?: string) {
    return new Promise((resolve, reject) => {
      this.isFormValidError = true;
      if (this.correspondForm.invalid) {
        return;
      }
      this.correspondForm.value.DocStatus = docStatus;
      let paylaod = this.correspondForm.value;
      paylaod.Orgdo = this.storageService.patientData.deptOrgUnit;
      paylaod.AttendPhy = this.storageService.getUserProfile().Gpart;
      this.subscription = this.dayCaseDashboard
        .saveCorrespondenceDocument(paylaod)
        .subscribe({
          next: (data: any) => { },
          error: (err: any) => {
            this.sharedService.waringSwallModel(`Error ${err}`);
            this.sharedService.waringSwallModel(
              `PUT Error at Correspondence document : ${err}`
            );
          },
          complete: () => {
            resolve(true);
            if (actiontype === 'edit') {
              this.sharedService.successSwallModel(
                'Correspondence document updated successfully'
              );
            } else {
              this.sharedService.successSwallModel(
                'Correspondence document created successfully'
              );
            }
          },
        });
    });
  }

}
