import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { AdmissionService } from '@services/admission/admission.service';
import { DataShareService } from '@services/data-share.service';
import { InPatientConfigurationService } from '@services/e-kardex/inPatient.service';
import {
  DiagnosesData,
  SurgeryTeamData,
} from '@services/e-kardex/interfaces/inpatient-data';
import { UserConfig } from '@services/e-kardex/interfaces/user-config';
import { UserConfigurationService } from '@services/e-kardex/user-configuration.service';
import { ActionType } from '@services/interfaces/common.enum';
import { SharedService } from '@services/shared.service';
import { StorageService } from '@services/storage.service';
import { catchError, of, Subscription } from 'rxjs';
import { ConfigPopup } from 'src/app/core/config-popup/config-popup.component';
@UntilDestroy()
@Component({
  selector: 'app-surgery-operation-note',
  templateUrl: './surgery-operation-note.component.html',
  styleUrls: ['./surgery-operation-note.component.scss'],
})
export class SurgeryOperationNoteComponent implements OnInit {
  @Input() soapFormEvent: string;
  inPatientDataSet: FormGroup;
  surgerySubscription: Subscription;
  surgeryTeamData: SurgeryTeamData[] = [];
  surgeryTableData: SurgeryTeamData[] = [];
  inPatientSurgeryHeaderData: any[];
  inPatientDiagnosisHeaderData: any[];
  diagnosisData: DiagnosesData[];
  subscription: Subscription;
  preDiagnosisSubscription: Subscription;
  postDiagnosisSubscription: Subscription;
  preDiagnosisTableData: DiagnosesData[] = [];
  private actionTypeSubscription$: Subscription;
  @ViewChild('inPatientPopup', { static: true }) configPopup: ConfigPopup;
  postDiagnosisTableData: DiagnosesData[] = [];
  docKey: any;
  paramsObject: any;
  constructor(
    private inPatientConfigurationService: InPatientConfigurationService,
    private route: ActivatedRoute,
    private admissionService: AdmissionService,
    public userConfigurationService: UserConfigurationService,
    private dataShareService: DataShareService,
    public storageService: StorageService,
    public sharedService:SharedService
  ) {
    this.inPatientDataSet = new FormGroup({
      DocKey: new FormControl(''),
      OperationPerformed: new FormControl(''),
      OperativeComplication: new FormControl(''),
      SpecimenRemoved: new FormControl(''),
      BloodLoss: new FormControl(''),
      BloodTransfused: new FormControl(''),
      ProcedureRemarks: new FormControl(''),
      AnticipatedComplications: new FormControl(''),
    });

    this.route.queryParams.subscribe((params) => {
      this.paramsObject = params;
    });
  }

  ngOnInit(): void {
    this.inPatientSurgeryHeaderData = [
      { columnTitle: 'Code', fieldName: 'Code', class: 'w-10' },
      { columnTitle: 'Description', fieldName: 'Description', class: 'w-25' },
      {
        columnTitle: 'Emp Responsible',
        fieldName: 'EmployeeResponsible',
        class: 'w-17',
      },
      {
        columnTitle: 'Employee Name',
        fieldName: 'EmployeeName',
        class: 'w-30',
      },
      { columnTitle: 'Date In', fieldName: 'NewDateIn', class: '' },
      { columnTitle: 'Date Out', fieldName: 'NewDateOut', class: '' },
    ];
    this.inPatientDiagnosisHeaderData = [
      { columnTitle: 'Code', fieldName: 'Code', class: 'w-25' },
      { columnTitle: 'Description', fieldName: 'Description', class: 'w-48' },
      { columnTitle: '', fieldName: 'EmployeeResponsible', class: 'w-17' },
    ];

    this.subscription = this.route.queryParams.subscribe(() => {
      this.loadSurgeyPopupData();
    });

    this.actionTypeSubscription$ = this.dataShareService.actionsType$.subscribe(
      (data) => {
        if (data != null) {
          if (data.type == ActionType.Add$ && data.value == '') {
            this.docKey = data.value.Dockey;
          }
          if (data.type == ActionType.Update$ && data.value) {
            this.docKey = data.value.docKey;
            this.getSurgeryOprationList(data.value.docKey);
          }
          if (data.type == ActionType.Copy$ && data.value) {
            this.docKey = data.value.docKey;
            this.getSurgeryOprationList(data.value.docKey);
          }
        }
      }
    );
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.soapFormEvent.currentValue == 'add') {
      if (this.admissionService.isCloneSurgeryOprationNoteForm) {
        this.saveForm(false);
      } else {
        this.saveForm(false);
      }
    }
    if (changes.soapFormEvent.currentValue == 'edit') {
      this.saveForm(false);
    }

    if (changes.soapFormEvent.currentValue == 'release') {
      if (this.admissionService.isCloneSurgeryOprationNoteForm) {
        this.saveForm(true);
      } else {
        if (this.admissionService.isEditSurgeryOprationNoteForm) {
        this.releaseForm(true);
        } else {
          this.saveForm(true);
        }
      }
    }

    if (
      this.admissionService.isEditSurgeryOprationNoteForm ||
      this.admissionService.isCloneSurgeryOprationNoteForm
    ) {
      this.getSurgeryOprationList(
        this.admissionService.selectedCurrentDocDetails.Dockey
      );
    }
  }
  patientVisitRecord: any;
  getSurgeryOprationList(Dockey) {
    this.inPatientConfigurationService
      .getPatientVisitDataByDocKey(Dockey,this.paramsObject)
      .pipe(
        untilDestroyed(this),
        catchError((err) => {
          return of([]);
        })
      )
      .subscribe((patientResult: any) => {
        this.patientVisitRecord = patientResult;
        if (patientResult && patientResult.PATDOCTOOPERRPTDOCDETAIL && patientResult.PATDOCTOOPERRPTDOCDETAIL.results && patientResult.PATDOCTOOPERRPTDOCDETAIL.results.length) {
      patientResult.PATDOCTOOPERRPTDOCDETAIL.results.forEach((obj) => {
        if (patientResult.Dtid === "ZMED_OPERT") {
          this.inPatientDataSet.patchValue({
            DocKey: obj.DocKey,
            OperationPerformed: obj.OperationPerformed,
            OperativeComplication: obj.OperativeComplication,
            SpecimenRemoved: obj.SpecimenRemoved,
            BloodLoss: obj.BloodLoss,
            BloodTransfused: obj.BloodTransfused,
            ProcedureRemarks: obj.ProcedureRemarks,
            AnticipatedComplications: obj.AnticipatedComplications,
          });
        }
      })
    }
    if (patientResult && patientResult.PATDOCTOPREOPERATIVEDX && patientResult.PATDOCTOPREOPERATIVEDX.results && patientResult.PATDOCTOPREOPERATIVEDX.results.length) {
      this.preDiagnosisTableData = patientResult.PATDOCTOPREOPERATIVEDX.results;
    }
    if (patientResult && patientResult.PATDOCTOPOSTOPERATIVEDX && patientResult.PATDOCTOPOSTOPERATIVEDX.results && patientResult.PATDOCTOPOSTOPERATIVEDX.results.length) {
      this.postDiagnosisTableData = patientResult.PATDOCTOPOSTOPERATIVEDX.results;
    }
    if (patientResult && patientResult.PATDOCTOSURGICALTEAM && patientResult.PATDOCTOSURGICALTEAM.results && patientResult.PATDOCTOSURGICALTEAM.results.length) {
      this.surgeryTableData = patientResult.PATDOCTOSURGICALTEAM.results;
    }
      });
  }

  unsubscriptionData() {
    if (this.surgerySubscription) {
      this.surgerySubscription.unsubscribe();
    }
    if (this.preDiagnosisSubscription) {
      this.preDiagnosisSubscription.unsubscribe();
    }
    if (this.postDiagnosisSubscription) {
      this.postDiagnosisSubscription.unsubscribe();
    }
  }
  userConfig: UserConfig = {} as UserConfig;

  releaseForm(status:any) {
    this.saveReleaseGeneratePayload();
    const saveDataList = {
      patientFormData: this.inPatientDataSet.value,
      surgeryData: this.surgeryTableData && this.surgeryTableData.length ? this.surgeryTableData : [],
      preDiganosisData: this.preDiagnosisTableData && this.preDiagnosisTableData.length ? this.preDiagnosisTableData : [],
      postDiagnosisData: this.postDiagnosisTableData && this.postDiagnosisTableData.length ? this.postDiagnosisTableData : [],
      patientDtId: 'ZMED_OPERT'
    };
    this.saveInPatientDocumentData(saveDataList, this.userConfig, true,status)
  }

  saveForm(status) {
    this.saveReleaseGeneratePayload();
    const loginUserData:any = this.storageService.getUserProfile()
    const saveDataList = {
      patientFormData: this.inPatientDataSet.value,
      surgeryData:
        this.surgeryTableData && this.surgeryTableData.length
          ? this.surgeryTableData
          : [],
      preDiganosisData:
        this.preDiagnosisTableData && this.preDiagnosisTableData.length
          ? this.preDiagnosisTableData
          : [],
      postDiagnosisData:
        this.postDiagnosisTableData && this.postDiagnosisTableData.length
          ? this.postDiagnosisTableData
          : [],
      patientDtId: 'ZMED_OPERT',
    };
  this.saveInPatientDocumentData(
      saveDataList,
      this.userConfig,
      false,
      status,
      this.paramsObject,
      loginUserData
    );
  }
  @Output() reloadTableList = new EventEmitter();
  async saveInPatientDocumentData(data: any, userConfiguration: UserConfig, documentType: boolean,status?:any,params?:any,loginUserData?:any) {
      const payloadData = {
        DocKey: data.patientFormData.DocKey !== undefined ? data.patientFormData.DocKey : "",
        Dtid: data.patientDtId,
        DtidText: "",
        Dodat: `\/Date(${new Date().getTime()})\/`,
        Dokst:"",
        Dokvr: "",
        Einri: this.storageService.einri ? this.storageService.einri : params.einri,
        Patnr: this.storageService.patnr ? this.storageService.patnr : params.patnr,
        Falnr: this.storageService.falnr ? this.storageService.falnr : params.falnr,
        Orgdo: localStorage.getItem('initOrg'),
        Lfdnr: this.storageService.lfdnr ? this.storageService.lfdnr : params.lfdnr,
        Visitdate: null,
        Referredby: "",
        Mitarbname: userConfiguration.UserId ?  userConfiguration.UserId : loginUserData?.Gpart,
        Mitarb: userConfiguration.VMA  ?  userConfiguration.UserId : loginUserData?.UserName,
        Released: status ? status : documentType,
        Etag: "",
        Erdattim: `\/Date(${new Date().getTime()})\/`,
      }
      const payload = { ...payloadData, PATDOCTOOPERRPTDOCDETAIL: { results: [data.patientFormData] }, DOCCATTOATTACHMENTS: { results: [] }, PATDOCTOPOSTOPERATIVEDX: { results: data.postDiagnosisData }, PATDOCTOPREOPERATIVEDX: { results: data.preDiganosisData }, PATDOCTOSURGICALTEAM: { results: data.surgeryData } };
      this.inPatientConfigurationService.saveSurgery(payload).subscribe({
          next: (data: any) => { },
          error: (err: any) => {
            this.sharedService.waringSwallModel(`Error ${err}`);
            this.sharedService.waringSwallModel(
              `PUT Error at Department of Surgery - Operation Notes : ${err}`
            );
          },
          complete: () => {
            this.reloadTableList.next(true);
            this.admissionService.cancelAllForm();
            this.admissionService.selectedCurrentDocDetails = '';
            this.admissionService?.clearSoapEvent?.next(true);
            if(payload?.Released){
               this.sharedService.successSwallModel(
                'Department of Surgery - Operation Notes Release successfully'
              );
              return
            }
            if (status === '2') {
              this.sharedService.successSwallModel(
                'Department of Surgery - Operation Notes updated successfully'
              );
            } else {
              this.sharedService.successSwallModel(
                'Department of Surgery - Operation Notes created successfully'
              );
            }
          },
        });
    }

  saveReleaseGeneratePayload() {
    if (this.surgeryTableData && this.surgeryTableData.length) {
      this.surgeryTableData.forEach((item) => {
        item.DocKey = item.DocKey ? item.DocKey : '';
        delete item.Dockey;
        delete item.isSelected;
        delete item.CaseNumber;
        delete item.ServiceSequenceNumber;
        delete item.SequenceNumberMovem;
        delete item.NewDateIn;
        delete item.NewDateOut;
        delete item.__metadata;
      });
    }
    if (this.preDiagnosisTableData && this.preDiagnosisTableData.length) {
      this.preDiagnosisTableData.forEach((item) => {
        item.DocKey = item.DocKey ? item.DocKey : '';
        delete item.isSelected;
        delete item.CaseNumber;
        delete item.PatientNumber;
        delete item.Institution;
        delete item.__metadata;
      });
    }
    if (this.postDiagnosisTableData && this.postDiagnosisTableData.length) {
      this.postDiagnosisTableData.forEach((item) => {
        item.DocKey = item.DocKey ? item.DocKey : '';
        delete item.isSelected;
        delete item.CaseNumber;
        delete item.PatientNumber;
        delete item.Institution;
        delete item.__metadata;
      });
    }
  }

  onOpenSurgeryPopup() {
    this.unsubscriptionData();
    const headerData = [
      { columnTitle: 'Code', fieldName: 'Code', class: 'w-15', disabled: true },
      {
        columnTitle: 'Description',
        fieldName: 'Description',
        class: 'w-30',
        disabled: true,
      },
      {
        columnTitle: 'Employee',
        fieldName: 'EmployeeResponsible',
        class: 'w-25',
        disabled: true,
      },
      {
        columnTitle: 'Employee Name',
        fieldName: 'EmployeeName',
        class: 'w-30',
        disabled: true,
      },
    ];
    this.loadSurgeyPopupData();
    this.configPopup.showPopup(
      headerData,
      this.surgeryTeamData,
      'in-patient-template'
    );
    if (this.surgerySubscription) {
      this.surgerySubscription.unsubscribe;
    }
    this.surgerySubscription = this.configPopup.onClose.subscribe((data) => {
      if (data && data.length) {
        if (!this.surgeryTableData) {
          this.surgeryTableData = []; // 🔐 safety fallback
        }
        data.forEach((item) => {
          this.surgeryTableData.push(item);
        });
      }
      this.surgerySubscription.unsubscribe();
    });
  }
  loadSurgeyPopupData() {
    this.inPatientConfigurationService
      .getSurgeryPopupData(this.paramsObject)
      .subscribe((surgeryData: any) => {
        if (
          surgeryData &&
          surgeryData.d &&
          surgeryData.d.results &&
          surgeryData.d.results.length
        ) {
          surgeryData.d.results.forEach((item) => {
            item.DocKey = item.Dockey;
            item.NewDateIn = item.DateIn !== null ? item.DateIn : '';
            item.NewDateOut = item.DateOut !== null ? item.DateOut : '';
            item.DateIn = item.DateIn !== null ? item.DateIn : null;
            item.DateOut = item.DateOut !== null ? item.DateOut : null;
          });
        }
        this.surgeryTeamData = surgeryData.d.results;
      });
  }

  onPreOperativePopup() {
    this.unsubscriptionData();
    const headerData = [
      {
        columnTitle: 'Diagnosis Code',
        fieldName: 'Code',
        class: 'w-20',
        disabled: true,
      },
      {
        columnTitle: 'Diagnosis Description',
        fieldName: 'Description',
        class: 'w-50',
        disabled: true,
      },
      {
        columnTitle: 'Comments',
        fieldName: 'Remarks',
        class: 'w-30',
        disabled: false,
      },
    ];
    this.loadDiagnosisData();
    this.configPopup.showPopup(
      headerData,
      this.diagnosisData,
      'in-patient-template'
    );
    if (this.preDiagnosisSubscription) {
      this.preDiagnosisSubscription.unsubscribe();
    }
    this.preDiagnosisSubscription = this.configPopup.onClose.subscribe(
      (data) => {
        if (data && data.length) {
          if (!this.preDiagnosisTableData) {
            this.preDiagnosisTableData = []; // 🔐 safety fallback
          }
          data.forEach((item) => {
            this.preDiagnosisTableData.push(item);
          });
        }
        this.preDiagnosisSubscription.unsubscribe();
      }
    );
  }

  onPostOperativePopup() {
    this.unsubscriptionData();
    const headerData = [
      {
        columnTitle: 'Diagnosis Code',
        fieldName: 'Code',
        class: 'w-20',
        disabled: true,
      },
      {
        columnTitle: 'Diagnosis Description',
        fieldName: 'Description',
        class: 'w-50',
        disabled: true,
      },
      {
        columnTitle: 'Comments',
        fieldName: 'Remarks',
        class: 'w-30',
        disabled: false,
      },
    ];
    this.loadDiagnosisData();
    this.configPopup.showPopup(
      headerData,
      this.diagnosisData,
      'in-patient-template'
    );
    if (this.postDiagnosisSubscription) {
      this.postDiagnosisSubscription.unsubscribe();
    }
    this.postDiagnosisSubscription = this.configPopup.onClose.subscribe(
      (data) => {
        if (data && data.length) {
          if (!this.postDiagnosisTableData) {
            this.postDiagnosisTableData = []; // 🔐 safety fallback
          }
          data.forEach((item) => {
            this.postDiagnosisTableData.push(item);
          });
        }
        this.postDiagnosisSubscription.unsubscribe();
      }
    );
  }

  loadDiagnosisData() {
    this.inPatientConfigurationService
      .getDiagnosisPopupData(this.paramsObject)
      .subscribe((diagnosesData: DiagnosesData[]) => {
        diagnosesData.forEach((item, index) => {
          item.DocKey = '';
          item.Remarks = '';
          item.AdmissionDxInd = false;
          item.DischargeDxInd = false;
          item.WorkingDxInd = false;
          item.PreoperativeDxInd = false;
          item.SurgeryDxInd = false;
          item.CauseOfDeathInd = false;
          item.DepartmentMainDxInd = false;
          item.DiagnosesOrder = index + 1;
        });
        this.diagnosisData = diagnosesData;
      });
  }

  ngOnDestroy(): void {
    if (this.surgerySubscription) {
      this.surgerySubscription.unsubscribe();
    }
    if (this.preDiagnosisSubscription) {
      this.preDiagnosisSubscription.unsubscribe();
    }
    if (this.postDiagnosisSubscription) {
      this.postDiagnosisSubscription.unsubscribe();
    }
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
