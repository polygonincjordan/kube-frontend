import { Component, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { untilDestroyed, UntilDestroy } from '@ngneat/until-destroy';
import { AdmissionService } from '@services/admission/admission.service';
import { EPrescriptionService } from '@services/e-Prescription/e-prescription.service';
import { PatientVisitService } from '@services/e-kardex/patient-visit.service';
import { UserConfigurationService } from '@services/e-kardex/user-configuration.service';
import { SopaDocumentComponent } from './documentation-list/sopa-document/sopa-document.component';
import Swal from 'sweetalert2';
import { StorageService } from '@services/storage.service';
import { InPatientConfigurationService } from '@services/e-kardex/inPatient.service';
import { EmergencyService } from '@services/emergency-dashboard/emergency-service';
import { UserConfig } from '@services/e-kardex/interfaces/user-config';
import { catchError, of } from 'rxjs';
import { NeonatalDischDocumentComponent } from 'src/app/shared-module/neonatal-disch-document/neonatal-disch-document.component';
import { DayCaseDashboardService } from '@services/day-case.dashboard/day-case-dashboard.service';
import { SharedService } from '@services/shared.service';
import { DatePipe } from '@angular/common';
@UntilDestroy()
@Component({
  selector: 'app-documentation',
  templateUrl: './documentation.component.html',
  styleUrls: ['./documentation.component.scss'],
})
export class DocumentationComponent implements OnInit {
  @ViewChild(NeonatalDischDocumentComponent) NeonatalDischDocumentComp: NeonatalDischDocumentComponent;
  @Output() onSearchDocument = new EventEmitter();
  @Output() isDocumentTypeFilter = new EventEmitter(false);
  @Output() onDateFilter = new EventEmitter();
  @Output() formEvent = new EventEmitter();

  @ViewChild('soapDocument', { static: true })
  soapDocument: SopaDocumentComponent;

  formDetailGroup: FormGroup;
  paramsObject: any;
  dateRange: any;
  selectedDocType: any;
  userConfig: UserConfig = {} as UserConfig;
  previousPeriodsList = [
    "Current Day", "Since Yesterday", "In Past 3 Days", "In Past Week", "In Past Month", "In Past Years", "Overall"
  ];
  previousPeriodValue: any = 'Overall';

  constructor(
    public ePrescriptionService: EPrescriptionService,
    public admissionService: AdmissionService,
    private route: ActivatedRoute,
    private formBuilder: FormBuilder,
    private userConfigurationService: UserConfigurationService,
    private patientVisitService: PatientVisitService,
    private storageService: StorageService,
    private inPatientConfigurationService: InPatientConfigurationService,
    private emergencyService: EmergencyService,
    private dayCaseDashboardService: DayCaseDashboardService,
    private sharedService: SharedService,
  ) {
    this.route.queryParams.subscribe((params) => {
      this.paramsObject = params;
      this.storageService.setEinri(params['einri']);
      this.storageService.setFalnr(params['falnr']);
      this.storageService.setLfdnr(params['lfdnr']);
      this.storageService.setPatnr(params['patnr']);

    });
  }

  ngOnInit(): void {
    this.getUserConfigSetting();
    this.phyOrderForm();
  }

  phyOrderForm() {
    this.formDetailGroup = this.formBuilder.group({
      SearchData: ['', [Validators.required]],
      DateRange: [, [Validators.required]],
      SelectDropdown: [null, [Validators.required]],
      previousPeriodValue: [null, [Validators.required]],
      selectedCreatedBy: [null, [Validators.required]],
      selectedDocumentOU: [null, [Validators.required]],
    });
  }

  onSearchChange(event: any): void {
    this.onSearchDocument.next(event.target.value);
  }

  onDateChange(event) {
    this.dateRange = event;
    this.admissionService.documentTypeDrop.next({
      documentType: this.selectedDocType,
      dateRange: this.dateRange,
      previousPeriodValue: this.formDetailGroup.value.previousPeriodValue,
      selectedCreatedBy: this.formDetailGroup.value.selectedCreatedBy,
      selectedDocumentOU: this.formDetailGroup.value.selectedDocumentOU,
    });
    // this.onDateFilter.next(event)
  }

  documentFilter(event) {
    this.selectedDocType = event;
    this.admissionService.documentTypeDrop.next({
      documentType: this.selectedDocType,
      dateRange: this.dateRange,
      previousPeriodValue: this.formDetailGroup.value.previousPeriodValue,
      selectedCreatedBy: this.formDetailGroup.value.selectedCreatedBy,
      selectedDocumentOU: this.formDetailGroup.value.selectedDocumentOU,
    });
  }

  resetFilter() {
    this.formDetailGroup.reset();
    this.onSearchDocument.next('');
    this.admissionService.documentTypeDrop.next({
      documentType: '',
      dateRange: '',
      previousPeriodValue: '',
      selectedCreatedBy: '',
      selectedDocumentOU: '',
    });
  }

  addEditForm(type: string) {
    if (type == 'save') {
      this.formEvent.next('add');
    } else if (type == 'edit') {
      this.formEvent.next('edit');
    } else if (type == 'copy') {
      this.formEvent.next('copy');
      this.admissionService.clearVarValue();
      this.admissionService.isPDFObstetricRisk = false;
      this.admissionService.educationAddForm('add');
    } else if(type == 'saveClose') {
      this.formEvent.next('saveClose');
      console.log(type, "1");
    } else {
      this.formEvent.next('release');
    }
  }

  deleteSelectData() {
    if (this.admissionService.selectedCurrentDocDetails) {
      if (this.admissionService.selectedCurrentDocDetails.DokstText == 'Released') return;
      Swal.fire({
        text: 'Are you sure you want to delete?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes',
        cancelButtonText: 'No',
        // customClass: 'myalertpopup',
      }).then((result) => {
        if (result.value) {
          if (this.admissionService.selectedCurrentDocDetails.Dtid === 'ZMED_SOAP') {
            this.deleteSoapDoc();
          }
          if (this.admissionService.selectedCurrentDocDetails.Dtid === 'ZMED_EDUAS') {
            this.deleteEducationAss();
          }
          if (this.admissionService.selectedCurrentDocDetails.Dtid === 'ZMED_PHDIS') {
            this.deleteDichargeSum();
          }
          if (this.admissionService.selectedCurrentDocDetails.Dtid === 'ZMED_MEDRP') {
            this.deleteMedicalDoc();
          }
          if (this.admissionService.selectedCurrentDocDetails.Dtid === 'ZMED_OBPPT') {
            this.deleteObsstetric();
          }
          if (this.admissionService.selectedCurrentDocDetails.Dtid === 'ZMED_OBANT') {
            this.deleteObsVteAnt();
          }
          if (this.admissionService.selectedCurrentDocDetails.Dtid === 'ZMED_OBPHY') {
            this.deleteObsGynDoc();
          }

          if (this.admissionService.selectedCurrentDocDetails.Dtid === 'ZMED_ORRPT') {
            this.deleteForm();
          }
          if (this.admissionService.selectedCurrentDocDetails.Dtid === 'ZMED_OPERT') {
            this.deleteForm();
          }
          if (this.admissionService.selectedCurrentDocDetails.Dtid === 'ZMED_NEOPN') {
            this.deleteNeoNatalDoc();
          }
          if (this.admissionService.selectedCurrentDocDetails.Dtid === 'ZMED_NEOMD') {
            this.deleteNeoNatalMRDoc();
          }
          if (this.admissionService.selectedCurrentDocDetails.Dtid === 'ZMED_PHASM') {
            this.deletePhysicianAssessDoc();
          }
          if (this.admissionService.selectedCurrentDocDetails.Dtid === 'ZMED_NBASM') {
            this.deleteNewBornPassDoc();
          }
          if (this.admissionService.selectedCurrentDocDetails.Dtid === 'ZMED_NICAD') {
            this.deleteNicuDoc();
          }
          if (this.admissionService.selectedCurrentDocDetails.Dtid === 'ZMED_VISIT') {
            console.log(this.admissionService.selectedCurrentDocDetails);
            this.deleteVisitNoteDocument();
          }
          if (this.admissionService.selectedCurrentDocDetails.Dtid === 'ZMED_TRFAS') {
            console.log(this.admissionService.selectedCurrentDocDetails);
            this.deleteTransferAssessDocument();
          }
          if (this.admissionService.selectedCurrentDocDetails.Dtid === 'ZMED_NEODS') {
            this.deleteNeonatalDischarge();
          }
          if (this.admissionService.selectedCurrentDocDetails.Dtid === 'ZMED_PDASM') {
            this.deletePediatricAdmAssess(this.admissionService.selectedCurrentDocDetails.Dockey);
          }
        }
      });
    }
  }
     //working on here (Pediatrics Admission Assessment) bottom one
   deletePediatricAdmAssess(docKey: string) {
      this.emergencyService.deletePediatricAdmAssesDoc(docKey).subscribe({
          next: (_success: any) => {
            this.admissionService.isRealoadData.next(true);
                Swal.fire({
              text: "Document is deleted successfully",
              icon: 'success',
              confirmButtonText: 'Ok',
              // customClass: 'myalertpopup'
            })
          },
          error: (_error: any) => {
                Swal.fire({
              text: `${_error.error.error.innererror?.errordetails[0]?.message}`,
              icon: 'warning',
              confirmButtonText: 'Ok',
              // customClass: 'myalertpopup'
            })
          }
        }
        );
  }
  directReleaseNeonatalDischargeDoc() {
     this.dayCaseDashboardService
      .fetcNeonatalDischargeDocDetails(this.admissionService.selectedCurrentDocDetails.Dockey).subscribe({
        next: (data: any) => {
          let paylaod = data.d.results[0];
          delete paylaod.__metadata
          paylaod.DocStatus = '2';
            this.dayCaseDashboardService.saveNeonatalDischargeDocument({ d: paylaod }).subscribe({
            next: (data: any) => { },
            error: (err: any) => {
              this.sharedService.waringSwallModel(`Error ${err}`);
              this.sharedService.waringSwallModel(`POST Error at Nurse Endorsment : ${err}`);
            },
            complete: () => {
              this.sharedService.successSwallModel('Neonatal Discharge Summary released successfully');
              this.admissionService.isRealoadData.next(true);
            }
          });
        },
        error: (err: any) => {
          this.sharedService.waringSwallModel(`Error ${err}`);
          this.sharedService.waringSwallModel(
            `POST Error at Nurse Endorsment : ${err}`
          );
        }
      });
  }

  deleteDichargeSum() {
    this.inPatientConfigurationService.deleteInPatientPhdisData(
      this.admissionService.selectedCurrentDocDetails.Dockey
    ).then((res) => {
      this.admissionService.isRealoadData.next(true);
    })
  }


  filterPeriodDate() {
    // this.filterByPeriod();
    // this.sort();
    this.admissionService.documentTypeDrop.next({
      documentType: this.selectedDocType,
      dateRange: this.dateRange,
      previousPeriodValue: this.formDetailGroup.value.previousPeriodValue,
      selectedCreatedBy: this.formDetailGroup.value.selectedCreatedBy,
      selectedDocumentOU: this.formDetailGroup.value.selectedDocumentOU,
    });
  }


  parseODataDate(odataDate: string): Date {
    // Extract timestamp from the OData date format
    let timestamp = parseInt(odataDate.match(/\/Date\((\d+)\)\//)?.[1] || "0", 10);
    return new Date(timestamp);
  }

  isSameDate(date1: Date, date2: Date): boolean {
    return date1.toDateString() === date2.toDateString();
  }


  saveEducationForm() {
    this.admissionService.isSaveEducationData.next(true);
  }
  saveMedicalForm() {
    this.admissionService.isSaveMedicalDocumnet.next(true);
  }
  saveSoapDocument() {
    this.admissionService.isSaveSoapDocumnet.next(true);
  }
  updateSoapDocument() {
    this.admissionService.isUpdateSoapDocumnet.next(true);
  }

  getSoapDoc() {
    this.userConfigurationService
      .getSoapPatientdata(
        this.admissionService.selectedCurrentDocDetails.Dockey,
        this.paramsObject.einri,
        this.paramsObject.falnr
      )
      .subscribe((patientResult: any) => {
        let patientData = patientResult?.d?.results[0];
        if (patientData) {
          patientData.Released = 'X';
          this.patientVisitService
            .savePatientVisitData(patientData)
            .then((res: any) => { });
        }
      });
  }

  deleteSoapDoc() {
    this.patientVisitService
      .deletePatientVisitData(this.admissionService.selectedCurrentDocDetails)
      .then(() => {
        this.admissionService.isRealoadData.next(true);
      });
  }

  deleteObsstetric() {
    this.admissionService
      .deleteObstetricDoc(this.admissionService.selectedCurrentDocDetails.Dockey)
      .subscribe(() => {
        this.admissionService.isRealoadData.next(true);
      });
  }

  deleteObsVteAnt() {
    this.admissionService
      .deleteObsVteAnt(this.admissionService.selectedCurrentDocDetails.Dockey)
      .subscribe(() => {
        this.admissionService.isRealoadData.next(true);
      });
  }

  deleteEducationAss() {
    this.admissionService
      .deleteEducationDetails(this.admissionService.selectedCurrentDocDetails.Dockey)
      .subscribe(() => {
        this.admissionService.isRealoadData.next(true);
      });
  }

  toReleaseSoapDoc() {
    if (this.admissionService.selectedCurrentDocDetails.DokstText == 'Released') return;
    if (this.admissionService.selectedCurrentDocDetails.Dtid === 'ZMED_SOAP') {
      this.soapDocumentRelease();
    }

    if (this.admissionService.selectedCurrentDocDetails.Dtid === 'ZMED_PHDIS') {
      this.dischargeSumRelease();
    }
    if (this.admissionService.selectedCurrentDocDetails.Dtid === 'ZMED_MEDRP') {
      this.medicalDocumentRelease();
    }
    if (this.admissionService.selectedCurrentDocDetails.Dtid === 'ZMED_OBPPT') {
      this.releaseObste();
    }
    if (this.admissionService.selectedCurrentDocDetails.Dtid === 'ZMED_OBANT') {
      this.releaseObsVteAnt();
    }
    if (this.admissionService.selectedCurrentDocDetails.Dtid === 'ZMED_EDUAS') {
      this.releaseEducatonAss();
    }
    if (this.admissionService.selectedCurrentDocDetails.Dtid === 'ZMED_OBPHY') {
      this.releaseObsGynDoc();
    }

    if (this.admissionService.selectedCurrentDocDetails.Dtid === 'ZMED_ORRPT') {
      this.getOperationReport();
    }
    if (this.admissionService.selectedCurrentDocDetails.Dtid === 'ZMED_NEOPN') {
      this.releaseNeoNatalDoc();
    }
    if (this.admissionService.selectedCurrentDocDetails.Dtid === 'ZMED_NEOMD') {
      this.releaseNeoNatalMRDoc();
    }
    if (this.admissionService.selectedCurrentDocDetails.Dtid === 'ZMED_PHASM') {
      this.releasePhysicianAssessDoc();
    }
    if (this.admissionService.selectedCurrentDocDetails.Dtid === 'ZMED_VISIT') {
      this.releaseVisitNoteDoc();
    }
    if (this.admissionService.selectedCurrentDocDetails.Dtid === 'ZMED_NBASM') {
      this.releaseNewBorn();
    }
    if (this.admissionService.selectedCurrentDocDetails.Dtid === 'ZMED_NICAD') {
      this.releaseNicu();
    }
    if (this.admissionService.selectedCurrentDocDetails.Dtid === 'ZMED_NEODS') {
      this.directReleaseNeonatalDischargeDoc();
    }
     if (this.admissionService.selectedCurrentDocDetails.Dtid === 'ZMED_TRFAS') {
       this.releasePhysicianDoc()
    }
     if (this.admissionService.selectedCurrentDocDetails.Dtid === 'ZMED_PDASM') {
       this.releasePediatricAdmAssesDoc()
    }
     if (this.admissionService.selectedCurrentDocDetails.Dtid === 'ZMED_OPERT') {
       this.releaseSurgaryDoc()
    }
  }

  releaseEducatonAss() {
    this.admissionService.getDocuEducationDetails(this.admissionService.selectedCurrentDocDetails.Dockey).subscribe((res: any) => {
      console.log(res, "--");

      let d: any = {
        d: res?.d?.results[0],
      };
      d.d.DocStatus = '2';
      d.d.AttendPhy = this.storageService.getUserProfile().Gpart;
      this.admissionService.saveEducationData(d).subscribe(
        (result) => {
          this.admissionService.isRealoadData.next(true);
        }
      );
    })
  }

  //working on here
  releasePediatricAdmAssesDoc() {
    this.emergencyService.getPediatricAdmAssesDocDetails(this.admissionService.selectedCurrentDocDetails.Dockey).subscribe((res: any) => {
      console.log(res, "--");

      let d: any = {
        d: res?.d?.results[0],
      };
      d.d.DocStatus = '2';
      d.d.AttendPhy = this.storageService.getUserProfile().Gpart;
       this.emergencyService.CreatePediatricAdmAssesDoc(d).subscribe(
        (result) => {
          this.sharedService.successSwallModel('Paediatrics Physician Admission Assessment Document Release Successfully')
          this.admissionService.isRealoadData.next(true);
        }
      );
    })
  }
  releasePhysicianDoc() {
    let json = {
      Dockey:this.admissionService.selectedCurrentDocDetails.Dockey
    }
    this.admissionService.getTansferAssessData(json).subscribe((res: any) => {
      console.log(res, "--");

      let d: any = {
        d: res?.results[0],
      };
      d .d.DocStatus = '2';
      if (d.d.Datee != '') {
  // Extract timestamp from "/Date(1747785600000)/"
  const match = /\/Date\((\d+)\)\//.exec(d.d.Datee);
  if (match && match[1]) {
    const dateObj = new Date(+match[1]); // convert to Date
    d.d.Datee = `${new DatePipe('en-US').transform(
      dateObj,
      'yyyy-MM-dd'
    )}T00:00:00`;
  } else {
    d.d.Datee = ''; // fallback or handle invalid case
  }
}
      delete d.d.__metadata;
      d.d.AttendPhy = this.storageService.getUserProfile().Gpart;
      this.admissionService.releaseTransferDoc(d.d).subscribe(
        (result) => {
          this.admissionService.isRealoadData.next(true);
        }
      );
    })
  }
  releaseSurgaryDoc() {
    let json = {
      Dockey:this.admissionService.selectedCurrentDocDetails.Dockey
    }
    this.inPatientConfigurationService.getPatientVisitDataByDocKey(json.Dockey,this.paramsObject).subscribe((res: any) => {
      console.log(res, "--");

      let d: any = {
        d: res,
      };
      d .d.Released = true;
      if (d.d.Erdattim != '') {
  // Extract timestamp from "/Date(1747785600000)/"
  const match = /\/Date\((\d+)\)\//.exec(d.d.Erdattim);
  if (match && match[1]) {
    const dateObj = new Date(+match[1]); // convert to Date
    d.d.Erdattim = `${new DatePipe('en-US').transform(
      dateObj,
      'yyyy-MM-dd'
    )}T00:00:00`;
  } else {
    d.d.Erdattim = ''; // fallback or handle invalid case
  }
      }
      if (d.d.Dodat != '') {
  // Extract timestamp from "/Date(1747785600000)/"
  const match = /\/Date\((\d+)\)\//.exec(d.d.Dodat);
  if (match && match[1]) {
    const dateObj = new Date(+match[1]); // convert to Date
    d.d.Dodat = `${new DatePipe('en-US').transform(
      dateObj,
      'yyyy-MM-dd'
    )}T00:00:00`;
  } else {
    d.d.Dodat = ''; // fallback or handle invalid case
  }
      }
      delete d.d.__metadata;
      d.d.AttendPhy = this.storageService.getUserProfile().Gpart;
      this.inPatientConfigurationService.saveSurgery(d.d).subscribe(
        (result) => {
          this.admissionService.isRealoadData.next(true);
           this.sharedService.successSwallModel('Department of Surgery - Operation Notes Release Successfully')
        }
      );
    })
  }

  soapDocumentRelease() {
    if (
      this.admissionService.selectedCurrentDocDetails.DokstText === 'Released'
    ) {
      return;
    }
    this.userConfigurationService
      .getSoapPatientdata(
        this.admissionService.selectedCurrentDocDetails.Dockey,
        this.paramsObject.einri,
        this.paramsObject.falnr
      )
      .subscribe((patientResult: any) => {
        let patientData = patientResult?.d?.results[0];
        if (patientData) {
          patientData.Released = 'X';
          patientData.VisitDate = this.getDate(patientData.Visitdate);
          this.patientVisitService
            .toReleaseSoapPatientVisitData(patientData)
            .then((res: any) => {
              this.admissionService.isRealoadData.next(true);
            });
        }
      });
  }

  releaseObste() {
    this.admissionService
      .getObstetricData(this.admissionService.selectedCurrentDocDetails.Dockey)
      .subscribe((resp) => {
        if (resp && resp.results && resp.results.length) {
          let obstetricData = resp.results[0];
          obstetricData.DocStatus = '2';
          obstetricData.AttendPhy = this.storageService.getUserProfile().Gpart;
          this.admissionService
            .updateObstetricDoc(obstetricData).subscribe((resp) => {
              this.admissionService.isRealoadData.next(true);
            });
        }
      });
  }

  releaseObsVteAnt() {
    this.admissionService
      .getObsVteAntData(this.admissionService.selectedCurrentDocDetails.Dockey)
      .subscribe((resp) => {
        if (resp && resp.results && resp.results.length) {
          let obstetricData = resp.results[0];
          obstetricData.DocStatus = '2';
          this.admissionService
            .updateObsVteAntDoc(obstetricData).subscribe((resp) => {
              this.admissionService.isRealoadData.next(true);
            });
        }
      });
  }

  getUserConfigSetting() {
    this.userConfigurationService
      .getUserConfigData()
      .pipe(
        untilDestroyed(this),
        catchError((err) => {
          return of([]);
        })
      )
      .subscribe((userconfig: UserConfig) => {
        this.userConfig = userconfig;
        // this.periodParameterMonthSelectValue =
        //   this.userconfig.PeriodParameterMonth;
      });
  }

  getOperationReport() {
    this.admissionService
      .getPatientVisitDataByDocKey(
        this.admissionService.selectedCurrentDocDetails.Dockey,
        this.paramsObject.einri,
        this.paramsObject.patnr
      )
      .subscribe((res: any) => {
        if (res.PATDOCTOOPERRPTDOCDETAIL.results.length) {
          let operation: any = {
            patientFormData: res.PATDOCTOOPERRPTDOCDETAIL.results[0]
          }
          this.admissionService
            .saveOperationReport(
              operation,
              this.userConfig,
              true,
              this.paramsObject,
              this.admissionService.selectedCurrentDocDetails.Dockey
            )
            .subscribe((res: any) => {
              this.admissionService.cancelAllForm();
              this.admissionService.isSaveEducationData.next(true);
              this.admissionService.isRealoadData.next(true);
            });
          // this.inPatientOrrptDataSet.patchValue(res.PATDOCTOOPERRPTDOCDETAIL.results[0])
        }
      });
  }

  dischargeSumRelease() {
    this.inPatientConfigurationService
      .getPatientSummaryDataByDocKey(
        this.admissionService.selectedCurrentDocDetails.Dockey
      )
      .subscribe((resp) => {
        if (resp && resp.results && resp.results.length) {
          const FormData = resp.results[0].ToFormData.results[0];
          const saveDataList = {
            patientFormData: FormData,
            releaseForm: true,
          };
          this.admissionService
            .saveInPatientPhdisData(
              saveDataList,
              this.admissionService.dichargeUserConfig,
              this.paramsObject
            )
            .subscribe((resp) => {
              this.admissionService.cancelAllForm();
              this.admissionService.isSaveEducationData.next(true);
              this.admissionService.isRealoadData.next(true);
            });
        }
      });
  }

  getDate(value) {
    if (value) {
      var str = value;
      var num = parseInt(str.replace(/[^0-9]/g, ''));
      var date = new Date(num);
      return date;
    }
  }
  allOrderRemoveDateFilter() { }

  showMainHeader() {
    if (
      !this.admissionService.isAddEditEducationAsset &&
      !this.admissionService.isAddEditMedicalForm &&
      !this.admissionService.isAddEditPhysicianForm &&
      !this.admissionService.isAddEditSopaDocument &&
      !this.admissionService.isAddEditDischargeSummery &&
      !this.admissionService.isAddEditObstetricRisk &&
      !this.admissionService.isAddEditObsVteAnt &&
      !this.admissionService.isAddEditObsGynForm &&
      !this.admissionService.isAddEditOperationReport &&
      !this.admissionService.isAddEditDocVisitForm &&
      !this.admissionService.isAddEditNeonatal &&
      !this.admissionService.isAddEditNeonatalMR &&
      !this.admissionService.isAddEditTransferAssestForm &&
      !this.admissionService.isAddEditDocPaediatricsAdmissionForm &&
      !this.admissionService.isAddEditNeonatalDischarge &&
      !this.admissionService.isAddNicuForm

    ) {
      return true;
    }
    return false;
  }

  deleteForm() {
    this.admissionService.deleteOperationReportDoc(this.admissionService.selectedCurrentDocDetails.Dockey).subscribe((res) => {
      this.admissionService.isRealoadData.next(true);
    })
  }
  // medical
  deleteMedicalDoc() {
    this.emergencyService
      .deleteMedReport(this.admissionService.selectedCurrentDocDetails)
      .subscribe(() => {
        this.admissionService.isRealoadData.next(true);
      });
  }
  medicalDocumentRelease() {
    if (
      this.admissionService.selectedCurrentDocDetails.DokstText === 'Released'
    ) {
      return;
    }
    const json = {
      Dockey: this.admissionService.selectedCurrentDocDetails.Dockey,
    }
    this.emergencyService
      .getMedReportData(json
      )
      .subscribe((patientResult: any) => {
        let patientData = patientResult?.d?.results[0];
        if (patientData) {
          patientData['DocStatus'] = '2';
          this.emergencyService
            .releaseMedDoc(patientData)
            .subscribe((res: any) => {
              this.admissionService.isRealoadData.next(true);
              this.sharedService.successSwallModel('Medical Report Document Relesed Successfully');
            });
        }
      });
  }
  // obs gyn
  deleteObsGynDoc() {
    this.admissionService
      .deleteObsGynDoc(this.admissionService.selectedCurrentDocDetails)
      .subscribe(() => {
        this.admissionService.isRealoadData.next(true);
      });
  }
  releaseObsGynDoc() {
    if (
      this.admissionService.selectedCurrentDocDetails.DokstText === 'Released'
    ) {
      return;
    }
    const json = {
      Einri: this.storageService.einri,
      Falnr: this.storageService.falnr
    }
    this.admissionService
      .getObsGynData(json
      )
      .subscribe((patientResult: any) => {
        let patientData = patientResult?.results[0];
        if (patientData) {
          patientData['DocStatus'] = '2';
          this.admissionService
            .releaseObsGynDoc(patientData)
            .subscribe((res: any) => {
              this.admissionService.isRealoadData.next(true);
            });
        }
      });
  }
  //
  // neo natal
  deleteNeoNatalDoc() {
    this.admissionService
      .deleteNeoNatalDoc(this.admissionService.selectedCurrentDocDetails)
      .subscribe(() => {
        this.admissionService.isRealoadData.next(true);
      });
  }
  releaseNeoNatalDoc() {
    if (
      this.admissionService.selectedCurrentDocDetails.DokstText === 'Released'
    ) {
      return;
    }
    const json = {
      Dockey: this.admissionService.selectedCurrentDocDetails.Dockey,
    }
    this.admissionService
      .getNeoNatalData(json
      )
      .subscribe((patientResult: any) => {
        let patientData = patientResult?.d?.results[0];
        if (patientData) {
          patientData['DocStatus'] = '2';
          this.admissionService
            .releaseNeoNatalDoc(patientData)
            .subscribe((res: any) => {
              this.admissionService.isRealoadData.next(true);
            });
        }
      });
  }
  //
  // neo natal medical report
  deleteNeoNatalMRDoc() {
    this.admissionService
      .deleteNeoNatalMRDoc(this.admissionService.selectedCurrentDocDetails)
      .subscribe(() => {
        this.admissionService.isRealoadData.next(true);
      });
  }
  releaseNeoNatalMRDoc() {
    if (
      this.admissionService.selectedCurrentDocDetails.DokstText === 'Released'
    ) {
      return;
    }
    const json = {
      Dockey: this.admissionService.selectedCurrentDocDetails.Dockey,
    }
    this.admissionService
      .getNeoNatalMRData(json
      )
      .subscribe((patientResult: any) => {
        let patientData = patientResult?.d?.results[0];
        if (patientData) {
          patientData['DocStatus'] = '2';
          this.admissionService
            .releaseNeoNatalMRDoc(patientData)
            .subscribe((res: any) => {
              this.admissionService.isRealoadData.next(true);
            });
        }
      });
  }
  //
  // physician assessment
  deletePhysicianAssessDoc() {
    this.admissionService
      .deletePhysicianAssessDoc(this.admissionService.selectedCurrentDocDetails)
      .subscribe(() => {
        this.admissionService.isRealoadData.next(true);
      });
  }
  deleteNewBornPassDoc() {
    this.emergencyService
      .deleteNewBornDoc(this.admissionService.selectedCurrentDocDetails.Dockey)
      .subscribe(() => {
        this.admissionService.isRealoadData.next(true);
      });
  }
  deleteNicuDoc() {
    this.emergencyService
      .deleteNicuDoc(this.admissionService.selectedCurrentDocDetails.Dockey)
      .subscribe(() => {
        this.admissionService.isRealoadData.next(true);
      });
  }

  deleteVisitNoteDocument() {
    this.admissionService
      .deleteVisitNoteDocument(this.admissionService.selectedCurrentDocDetails.Dockey)
      .subscribe(() => {
        this.admissionService.isRealoadData.next(true);
      });
  }

  // Delete Neonatal Discharge Document
  async deleteNeonatalDischarge() {
    await this.dayCaseDashboardService.deleteNeonatalDischargeDocument(this.admissionService.selectedCurrentDocDetails.Dockey).subscribe(
      (_success: any) => {
        Swal.fire({
          text: "Document is deleted successfully",
          icon: 'success',
          confirmButtonText: 'Ok',
          // customClass: 'myalertpopup'
        })
        this.admissionService.isRealoadData.next(true);
      },
      (_error: any) => {
        Swal.fire({
          text: `${_error.error.error.innererror?.errordetails[0]?.message}`,
          icon: 'warning',
          confirmButtonText: 'Ok',
          // customClass: 'myalertpopup'
        })
        this.admissionService.isRealoadData.next(true);
      }
    );

  }

  deleteTransferAssessDocument() {
    this.admissionService
      .deleteTransferDoc(this.admissionService.selectedCurrentDocDetails)
      .subscribe(() => {
        this.admissionService.isRealoadData.next(true);
      });
  }

  releasePhysicianAssessDoc() {
    if (
      this.admissionService.selectedCurrentDocDetails.DokstText === 'Released'
    ) {
      return;
    }
    const json = {
      Dockey: this.admissionService.selectedCurrentDocDetails.Dockey,
    }
    this.admissionService
      .getPhysicianData(json
      )
      .subscribe((patientResult: any) => {
        let patientData = patientResult?.results[0];
        if (patientData) {
          patientData['DocStatus'] = '2';
          this.admissionService
            .createPhysicianData(patientData)
            .subscribe((res: any) => {
              this.admissionService.isRealoadData.next(true);
              this.sharedService.successSwallModel('Physician Assessment Release Successfully')
            });
        }
      });
  }

  releaseVisitNoteDoc() {
    if (this.admissionService.selectedCurrentDocDetails.DokstText === 'Released') {
      return;
    }
    const json = {
      Dockey: this.admissionService.selectedCurrentDocDetails.Dockey,
    }
    this.admissionService
      .releaseVisitNoteDoc(json)
      .subscribe((patientResult: any) => {
        this.admissionService.isRealoadData.next(true);
      });
  }

  releaseNewBorn() {
    this.emergencyService.getNewBornDetail(this.admissionService.selectedCurrentDocDetails.Dockey).subscribe((res: any) => {
      let d: any = {
        d: res?.d?.results[0],
      };
      d.d.DocStatus = '2';
      this.admissionService.createNewBorn(d).subscribe(
        (result) => {
          this.admissionService.isRealoadData.next(true);
        }
      );
    })
  }
  releaseNicu() {
    this.emergencyService.getNicuDetail(this.admissionService.selectedCurrentDocDetails.Dockey).subscribe((res: any) => {
      let d: any = {
        d: res?.d?.results[0],
      };
      d.d.DocStatus = '2';
      this.admissionService.createNicuSet(d).subscribe(
        (result) => {
          this.admissionService.isRealoadData.next(true);
        }
      );
    })
  }
  //
}
