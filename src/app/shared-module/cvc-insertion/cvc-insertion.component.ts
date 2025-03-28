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
  selector: 'app-cvc-insertion',
  templateUrl: './cvc-insertion.component.html',
  styleUrls: ['./cvc-insertion.component.scss']
})
export class CvcInsertionComponent implements OnInit {

  cvcInsertionForm: FormGroup;

  isFormValidError: boolean = false;
  paramsObject: any;
  docKey: any;
  private actionTypeSubscription$: Subscription;
  private subscription: Subscription;

  anatomicalList = [
    {
      label: 'Subdavian',
      value: '1'
    },
    {
      label: 'Intra-Jugular',
      value: '2'
    },
    {
      label: 'Femoral',
      value: '3'
    },
    {
      label: 'Implanted',
      value: '4'
    },
    {
      label: 'Umbilical',
      value: '5'
    },
    {
      label: 'Peripheral',
      value: '6'
    }
  ];

  venousCatheterList = [
    {
      label: 'Temporary contral line',
      value: '1'
    },
    {
      label: 'Temporary dialysis catheter',
      value: '2'
    },
    {
      label: 'PICC',
      value: '3'
    },
    {
      label: 'Hickman',
      value: '4'
    },
    {
      label: 'Port a-cath',
      value: '5'
    }
  ];

  cvcLumensList = [
    {
      label: '1',
      value: '1'
    },
    {
      label: '2',
      value: '2'
    },
    {
      label: '3',
      value: '3'
    }
  ];

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
            this.getCvcInsertionDocDetails(data.value.docKey);
          }
          if (data.type == ActionType.Copy$ && data.value) {
            this.docKey = data.value.docKey;
            this.getCvcInsertionDocDetails(data.value.docKey);
          }
        }
      }
    );
  }

  ngOnInit() {
    this.initForm();
  }

  initForm() {
    this.cvcInsertionForm = this.formBuilder.group({
      Dockey: "",
      Dtid: "ZMED_CVCI",
      Einri: this.paramsObject.einri,
      Patnr: this.paramsObject.patnr,
      Falnr: this.paramsObject.falnr,
      Lfdnr: this.paramsObject.lfdnr,
      Orgdo: this.storageService?.patientData?.deptOrgUnit,
      AttendPhy: this.storageService.getUserProfile()?.Gpart,
      DocStatus: "1",
      ReceivedTraining1: false,
      AmEmpowered2: false,
      CvcInsertion3: false,
      CvcInsertionBy: "",
      CvcInsertionDate: "",
      CvcInsertionTime: "",
      PatientLocation: "",
      AnatomicalSite: "",
      UltrasoundUsed: "",
      TypeCentralVenous: "",
      NumberCvcLumens: "",
      Cvc1: "",
      Cvc1Txt: "",
      Cvc1Comments: "",
      Cvc2: "",
      Cvc2Txt: "",
      Cvc21: "",
      Cvc21Txt: "",
      Cvc22: "",
      Cvc22Txt: "",
      Cvc23: "",
      Cvc23Txt: "",
      Cvc24: "",
      Cvc24Txt: "",
      Cvc25: "",
      Cvc25Txt: "",
      CvcComments: "",
      Cvc3Skin: "",
      Cvc3SkinTxt: "",
      Cvc3Contraindication: false,
      Cvc3Contraindication1: "",
      Cvc3Antiseptic: "",
      Cvc3AntisepticTxt: "",
      Cvc3Comments: "",
      Cvc4OptimalCatheter: "",
      Cvc4OptimalCatheterTxt: "",
      Cvc4Comments: "",
      ComplianceScore: "",
      AnyComplications: "",
      InsertionTrials1: false,
      InsertionTrials2: false,
      InsertionTrials3: false,
      InsertionTrials4: false,
      Comments: ""
    })
  }

  getCvcInsertionDocDetails(docKey?) {
    this.subscription = this.dayCaseDashboard
      .fetcCVCInsertionDocDetails(docKey)
      .subscribe({
        next: (data: any) => {
          this.cvcInsertionForm.patchValue({
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


  createCvcInsertionDocument(docStatus: any, actiontype?: string) {
    return new Promise((resolve, reject) => {
      this.isFormValidError = true;
      if (this.cvcInsertionForm.invalid) {
        return;
      }
      this.cvcInsertionForm.value.DocStatus = docStatus;
      let paylaod = this.cvcInsertionForm.value;

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

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
    if (this.actionTypeSubscription$) {
      this.actionTypeSubscription$.unsubscribe();
      this.dataShareService.sendActionType(null);
    }
  }

}
