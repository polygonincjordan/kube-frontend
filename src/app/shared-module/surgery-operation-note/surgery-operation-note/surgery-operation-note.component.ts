import {
  Component,
  Input,
  OnInit,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { untilDestroyed } from '@ngneat/until-destroy';
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
import { catchError, of, Subscription } from 'rxjs';
import { ConfigPopup } from 'src/app/core/config-popup/config-popup.component';

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
  postDiagnosisTableData: any;
  docKey: any;
  constructor(
    private inPatientConfigurationService: InPatientConfigurationService,
    private route: ActivatedRoute,
    private admissionService: AdmissionService,
    public userConfigurationService: UserConfigurationService,
     private dataShareService: DataShareService
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
        this.saveForm('3');
      } else {
        this.saveForm('1');
      }
    }
    if (changes.soapFormEvent.currentValue == 'edit') {
      this.saveForm('1');
    }

    if (changes.soapFormEvent.currentValue == 'release') {
      if (this.admissionService.isCloneSurgeryOprationNoteForm) {
        this.saveForm('5');
      } else {
        if (this.admissionService.isEditNeonatalDischarge) {
          this.saveForm('2');
        } else {
          this.saveForm('4');
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
    this.userConfigurationService
      .getPatientVisitData(Dockey)
      .pipe(
        untilDestroyed(this),
        catchError((err) => {
          return of([]);
        })
      )
      .subscribe((patientResult: any) => {
        this.patientVisitRecord = patientResult;
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

  saveForm(status) {
    this.saveReleaseGeneratePayload();
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
    this.inPatientConfigurationService.saveInPatientDocumentData(
      saveDataList,
      this.userConfig,
      false,
      status
    );
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
        data.forEach((item) => {
          this.surgeryTableData.push(item);
        });
      }
      this.surgerySubscription.unsubscribe();
    });
  }
  loadSurgeyPopupData() {
    this.inPatientConfigurationService
      .getSurgeryPopupData()
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
      .getDiagnosisPopupData()
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
