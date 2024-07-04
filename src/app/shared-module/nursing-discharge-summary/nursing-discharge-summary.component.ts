import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Patient } from '@services/e-kardex/interfaces/patient';
import { PatientService } from '@services/e-kardex/patient.service';
import { StorageService } from '@services/storage.service';
import { catchError, of } from 'rxjs';

@Component({
  selector: 'app-nursing-discharge-summary',
  templateUrl: './nursing-discharge-summary.component.html',
  styleUrls: ['./nursing-discharge-summary.component.scss'],
})
export class NursingDischargeSummaryComponent implements OnInit {
  selectedTabName: string = 'Discharge Plan';
  nursingDischargeForm: FormGroup;
  TODIAGNOSESFormArray: FormArray;

  tabLabelList = [
    'Discharge Plan',
    'Discharge Details',
    'Diagnosis',
    'Maternal Vaccination',
    'Environmental Safety',
  ];

  dischargeDropdownValue = [
    {
      label: 'N/A',
      value: '0',
    },
    {
      label: 'Yes',
      value: '1',
    },
    {
      label: 'No',
      value: '2',
    },
  ];

  modeOfDischargeValue = [
    {
      label: 'Car',
      value: '0',
    },
    {
      label: 'Ambulance',
      value: '1',
    },
    {
      label: 'Other',
      value: '2',
    },
  ];

  patientDischargeValue = [
    {
      label: 'Family',
      value: '0',
    },
    {
      label: 'Other',
      value: '1',
    },
  ];
  paramsObject: any;
  encounterId: any;

  constructor(
    private formBuilder: FormBuilder,
    private _route: ActivatedRoute,
    private storageService: StorageService,
    private patientService: PatientService
  ) {
    this._route.queryParams.subscribe((params) => {
      this.paramsObject = params;
      if (this.paramsObject.lfdnr) {
        this.encounterId =
          this.paramsObject.einri +
          this.paramsObject.falnr +
          this.paramsObject.lfdnr;
      }
      this.storageService.setEinri(this.paramsObject.einri);
      this.storageService.setFalnr(this.paramsObject.falnr);
      this.storageService.setLfdnr(this.paramsObject.lfdnr);
      this.storageService.setPatnr(this.paramsObject.patnr);
      this.getPatinetDetails(this.encounterId);
    });
  }

  public getPatinetDetails(encounterId) {
    this.patientService
      .getDataPatient(encounterId)
      .pipe(
        catchError(() => {
          return of({} as Patient);
        })
      )
      .subscribe((patientData: Patient) => {
        this.storageService.setPatientData(patientData);
      });
  }

  ngOnInit(): void {
    this.initForm();
    this.addDiagnosisList();
  }

  initForm() {
    this.nursingDischargeForm = this.formBuilder.group({
      Dockey: '',
      Dtid: 'ZMED_NRDIS',
      Einri: this.paramsObject.einri,
      Patnr: this.paramsObject.patnr,
      Falnr: this.paramsObject.falnr,
      Lfdnr: this.paramsObject.lfdnr,
      Orgdo: this.storageService.patientData.deptOrgUnit,
      DpMedicalFollow: '',
      DpDevices: '',
      DpAmbulance: '',
      DpTransfer: '',
      DpOthers: '',
      DischargeDate: '',
      DischargeTime: '',
      DiAdvice: '',
      DiFundus: '',
      DiWound: '',
      DiBreastCare: '',
      DiDischargeTo: '',
      DiPatientDeceased: '',
      DdMode: '',
      DdModeTxt: '',
      DdDischargedWith: '',
      DdDischargedWithTxt: '',
      DdDischargedAgainst: '',
      DdReason: '',
      DdDischargeSummary: '',
      DdDressingChanged: '',
      DdMedications: '',
      DdDevices: '',
      DdSupplies: '',
      DdProsthesis: '',
      DdRadiology: '',
      DdRelatedPatient: '',
      DdOutpatient: '',
      DdWhen: '',
      DdDischargeInstruct: '',
      MaternalVaccination: '',
      MvVaccine: '',
      MvBatch: '',
      MvAntiD: '',
      MvLotNo: '',
      MvDate: '',
      EnvironmentalSafety: '',
      EnvironmentalAss: '',
      EsShower: false,
      EsTub: false,
      EsRefrigerator: false,
      EsCool: false,
      EsToilet: false,
      EsDoorway: false,
      EsStairs: false,
      EsOther: false,
      EsOtherTxt: '',
      AttendPhy: this.storageService.getUserProfile().Gpart,
      DocStatus: '',
      TODIAGNOSES: new FormArray([]),
    });
  }

  addDiagnosisList() {
    this.TODIAGNOSESFormArray = this.nursingDischargeForm.get(
      'TODIAGNOSES'
    ) as FormArray;
    this.TODIAGNOSESFormArray.push(this.creatDiagnosisFormData());
  }

  creatDiagnosisFormData(): FormGroup {
    return this.formBuilder.group({
      Dockey: '',
      DCode: '',
      DDescription: '',
      DRemarks: '',
      DAdmission: false,
      DDischarge: false,
      DWorking: false,
      DPreoperative: false,
      DSurgery: false,
      DDeath: false,
      DDepartment: false,
      DHospital: false,
    });
  }

  switchTabs(tabName: string) {
    this.selectedTabName = tabName;
  }
}
