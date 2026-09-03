import { StorageService } from './../../../services/storage.service';
import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { EmergencyService } from '@services/emergency-dashboard/emergency-service';
import { BsModalRef, BsModalService, ModalOptions } from 'ngx-bootstrap/modal';
import { ErPhysicianComponent } from './er-physician/er-physician.component';
import Swal from 'sweetalert2';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { AdmissionService } from '@services/admission/admission.service';
import { UserConfigurationService } from '@services/e-kardex/user-configuration.service';
import { MedicalReportComponent } from './medical-report/medical-report.component';
import { EducationFormComponent } from './education-form/education-form.component';
import { InPatientDataResult } from '@services/e-kardex/interfaces/inpatient-data';
import { PatientVisitDataResult } from '@services/e-kardex/interfaces/patient-visit-data';
import { DiagnosisHistoryPopupComponent } from './dignosis-history-popup/diagnosis-history-popup.component';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { PatientHistoryService } from '@services/e-kardex/patient-history.service';
import { Observable, ReplaySubject, Subscription } from 'rxjs';
import { InPatientConfigurationService } from '@services/e-kardex/inPatient.service';
import { SharedService } from '@services/shared.service';
import { DayCaseDashboardService } from '@services/day-case.dashboard/day-case-dashboard.service';
import { CorrespondenceDocumentComponent } from 'src/app/shared-module/correspondence-document/correspondence-document.component';
import { DocsService } from '@services/docs.service';
import { hasPreviousDocumentVersions } from '@services/document-version-history.util';
@Component({
  selector: 'app-documentation',
  templateUrl: './documentation.component.html',
  styleUrls: ['./documentation.component.css']
})
export class DocumentationComponent implements OnInit {
  @ViewChild(ErPhysicianComponent) phyComp: ErPhysicianComponent;
  @ViewChild(MedicalReportComponent) medComp: MedicalReportComponent;
  @ViewChild(CorrespondenceDocumentComponent) CorrespondenceComp: CorrespondenceDocumentComponent;
  
  @ViewChild(EducationFormComponent) educationAssessmentComp: EducationFormComponent;
  @ViewChild('diagnosisHistory', { static: true })
  diagnosisHistory: DiagnosisHistoryPopupComponent;
  @ViewChild('releasepdfmodal') releasepdfmodal: TemplateRef<HTMLDivElement>;
  @ViewChild('notreleasedmodal') notreleasedmodal: TemplateRef<HTMLDivElement>;
  @ViewChild('selectIconPdf', { static: true }) selectIconPdf: TemplateRef<any>;
  @ViewChild('attachmentmodal') attachmentModal: any;
  modalRef: BsModalRef;
  phyAssess = false;
  nursAssess = false;
  attachments = false;
  educationAssessment = false;
  patienteducation = false;
  fallrisk = false;
  functional = false;
  nutritional = false;
  phyDocList = [];
  latestDocList = [];
  educationAssList = [];
  documentTypeFilter = []
  createDate: any;
  searchString: any = '';
  filterToDate: Date;
  filterFromDate: Date;
  dateRange: any;
  documentType: any;
  pdfUrl: any;
  openPhyAssess = false;
  actionType = '';
  selectedDocName: string;
  patientProfileDocumet: any;
  pdfTemplateRef: BsModalRef;
  documentTypeFilterValue: any[] = [];
  asc: boolean = true;
  desc: boolean = false;
  PatientData: any;
  medReport: boolean = false;
  openMedReport: boolean = false;
  openEducationAssessment: boolean = false;
  selectedDocData: any;
  medlatestDocList = [];
  medDocList = [];
  releaseDocumentImage: string;
  pdfUrlType: string;
  htmlData: any;
  selectedIconPdf: BsModalRef;

  createAttachmentForm: FormGroup;
  attachmentList: any;
  modalRefForStrucDoc: BsModalRef;
  userProfile: any;
  base64Value: string;
  mimetype: any;
  filename: any;
  file: File;
  selectedFile: File | null = null;
  documentUrl: SafeResourceUrl | null = null;

  patientVisitRecord: PatientVisitDataResult = {} as PatientVisitDataResult;
  inPatientVisitData: InPatientDataResult;
  pdfFormDiv: boolean;
  paramsObject: any;
  seletcedCurrentDoc: any;
  InOutPatientViewValue: { showBoth: boolean; showIn: boolean; showOut: boolean; };
  previousPeriodValue: any = 'Overall';
  selectedDocumentOU: any;
  selectedCreatedBy: any;
  selectedDocument: any;
  documentFilterList = [
    {
      label: 'ER Physician Assessment',
      value: 'EPA'
    },
    {
      label: 'Medical Report',
      value: 'MER'
    },
    // {
    //   label: 'ER Discharge Summary',
    //   value: 'EDS'
    // },
    {
      label: 'Education Assessment',
      value: 'EDA'
    },
    // {
    //   label: 'Correspondence Document',
    //   value: 'COD'
    // },
    {
      label: 'Attachments Document',
      value: 'ATD'
    }
  ]
  previousPeriodsList = [
    "Current Day", "Since Yesterday", "In Past 3 Days", "In Past Week", "In Past Month", "In Past Years", "Overall"
  ];
  createdDocumentUserList: any = [];
  documentTypeFilterValueClone: any = [];
  departmentOUList = [
    "CARMDAMC", "", "F21IUAMC"
  ];
  public isCorrespondenceDocument: boolean = false;
  public openCorrespondenceDocument: boolean = false;
  latestCorrespondenceList: any = []
  private subscription: Subscription;

  constructor(private modalService: BsModalService, private emergencyService: EmergencyService, private inPatientConfigurationService: InPatientConfigurationService, private userconfig: UserConfigurationService, private patientHistoryService: PatientHistoryService, 
    private storageService: StorageService, private route: ActivatedRoute, private sanitizer: DomSanitizer, private admissionService: AdmissionService, private userConfigurationService: UserConfigurationService, private formBuilder: FormBuilder, private sharedService: SharedService, private dayCaseDashboardService: DayCaseDashboardService, private docsService: DocsService) {
    this.route.queryParams.subscribe((params) => {
      this.paramsObject = params;
      this.storageService.setEinri(params['einri']);
      this.storageService.setFalnr(params['falnr']);
      this.storageService.setLfdnr(params['lfdnr']);
      this.storageService.setPatnr(params['patnr']);
    });
  }


  ngOnInit() {
    this.createAttachmentForm = this.formBuilder.group({
      attachmentType: [null, Validators.required],
      attachmentFile: [null, Validators.required],
    });
    this.getLatestAssessment();
    this.getPhyAssessment();
    this.getMedLatestAssessment();
    this.getEducationAssessment();
    this.getPatientProfile();
  }
  openPastHistory(template: TemplateRef<any>) {
    const config: ModalOptions = { class: 'modal-dialog-centered modal-lg pastdochistory' };
    this.modalRef = this.modalService.show(template, config);
  }
  selectAssessment(name, selectedDocData) {
    this.selectedDocData = selectedDocData;
    if (name == 'nursing') {
      this.phyAssess = false;
      this.nursAssess = false;
      this.medReport = false;
      this.attachments = false;
      this.educationAssessment = true;
      this.isCorrespondenceDocument = false;
      this.selectedDocName = 'Education Assessment'
    } else if (name == 'phy') {
      this.phyAssess = true;
      this.nursAssess = false;
      this.medReport = false;
      this.attachments = false;
      this.educationAssessment = false;
      this.isCorrespondenceDocument = false;
      this.selectedDocName = 'ER Physician Assessment'
    } else if (name == 'medreport') {
      this.phyAssess = false;
      this.nursAssess = false;
      this.medReport = true;
      this.attachments = false;
      this.educationAssessment = false;
      this.isCorrespondenceDocument = false;
      this.selectedDocName = 'Medical Report'
    } else if (name == 'attachments') {
      this.phyAssess = false;
      this.nursAssess = false;
      this.medReport = false;
      this.attachments = true;
      this.educationAssessment = false;
      this.isCorrespondenceDocument = false;
      this.selectedDocName = 'Attachments Document'
    } else if (name == 'isCorrespondenceDocument') {
      this.phyAssess = false;
      this.nursAssess = false;
      this.medReport = false;
      this.attachments = false;
      this.educationAssessment = false;
      this.isCorrespondenceDocument = true;
      this.selectedDocName = 'Correspondence Document'
    }
  }
  selectNursAssessment(name) {
    if (name == 'patienteducation') {
      this.patienteducation = true;
      this.fallrisk = false;
      this.functional = false;
      this.nutritional = false;
    } else if (name == 'fallrisk') {
      this.fallrisk = true;
      this.patienteducation = false;
      this.functional = false;
      this.nutritional = false;
    } else if (name == 'functional') {
      this.functional = true;
      this.patienteducation = false;
      this.fallrisk = false;
      this.nutritional = false;
    } else if (name == 'nutritional') {
      this.nutritional = true;
      this.functional = false;
      this.patienteducation = false;
      this.fallrisk = false;
    }
  }
  getDate(value) {
    if (value) {
      var str = value;
      var num = parseInt(str.replace(/[^0-9]/g, ''));
      var date = new Date(num);
      return date;
    }
  }
  getTime(value) {
    if (value) {
      var str = value;
      var str = str.replace(/[PT]/g, '');
      var str = str.replace(/[H]/g, ':');
      var str = str.replace(/[M]/g, ':');
      var str = str.replace(/[S]/g, '');
      return str;
    }
  }
  getLatestAssessment() {
    const json = {
      Einri: this.storageService.einri,
      Falnr: this.storageService.falnr,
      Patnr: this.storageService.patnr,
      Lfdnr: this.storageService.lfdnr
    }
    this.emergencyService.getLatestAssessment(json).subscribe(
      (_success: any) => {
        this.latestDocList = _success.d.results;
        // Note: phy create-and-release / copy-and-release no longer rely on this
        // refresh-driven trigger. They chain the release explicitly on the new
        // Dockey returned by the create/copy response (see createOrCopyThenRelease).
      },
      (_error: any) => { }
    );
  }

  // Correspondence Latest
  getCorrespondenceDocDetails() {
    const json = {
      Einri: this.storageService.einri,
      Falnr: this.storageService.falnr,
    }
    this.dayCaseDashboardService.correspondenceSetDocumentLatestDoc(json).subscribe({
      next: (_success: any) => {
        this.latestCorrespondenceList = _success.d.results
      },
      error: (err: any) => {
        console.error('Error  Data:', err);
        this.sharedService.waringSwallModel(`GET Error : ${err}`);
      },
    });
  }

  openCorrespondenceDocumentPdf(Dockey) {
    this.pdfUrl = '';
    this.dayCaseDashboardService
      .correspondenceDocPDF(Dockey)
      .subscribe((data: any) => {
        this.pdfUrlType = 'pdf';
        this.pdfUrlConvertToBlob(data?.d?.AttachmentData);
        // this.pdfUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
        //   'data:application/pdf;base64,' + data.d.AttachmentData
        // );
        const config: ModalOptions = {
          class: 'modal-dialog-centered modal-xl pdfmodal-size',
        };
        this.modalRef = this.modalService.show(this.releasepdfmodal, config);
      });
  }

  async createCorrespondenceDocument() {
    if (this.openCorrespondenceDocument) {
      let docStatus = '1';
      // if(this.selectedDocData?.Dockey) docStatus = '3';
      this.CorrespondenceComp.createCorrespondenceDocument(docStatus).then((formValue: any) => {
        if (formValue) {
          this.refresh();
        }
      }).catch((error: any) => {
        console.error('Error scale:', error);
        console.error('Error creating Glasgow coma scale:', error);
      });
    }
  }

  documentFilter(event, type) {
    if (type == 'date') {
      this.dateRange = event;
    }

    if (this.dateRange || this.documentType) {
      this.patientProfileDocumet = [];
      let filterValue = this.documentTypeFilterValue;
      if (this.documentType) {
        filterValue = filterValue.filter((element) => {
          if (this.documentType == element.Dtid) {
            return element;
          }
        })
      }

      if (this.dateRange) {
        this.filterFromDate = this.dateRange[0];
        this.filterToDate = this.dateRange[1];
        filterValue = filterValue.filter(item => {
          let itemDate = new Date(this.dateFormate(this.getDate(item.Dodat)));
          let fromDate = new Date(this.filterFromDate);
          let toDate = new Date(this.filterToDate);
          return itemDate >= fromDate && itemDate <= toDate;
        }
        );
      }
      this.patientProfileDocumet = this.groupBy(filterValue, 'Dodat');
    } else {
      this.patientProfileDocumet = this.groupBy(this.documentTypeFilterValue, 'Dodat');
    }
    this.sortedDocuments = Object.keys(this.patientProfileDocumet).map(key => ({
      date: new Date(parseInt(key.replace('/Date(', '').replace(')/', ''))),
      documents: this.patientProfileDocumet[key]
    }));
  }

  dateFormate(dt) {
    return dt.getFullYear() + "/" + (dt.getMonth() + 1) + "/" + dt.getDate();
  }

  getPhyAssessment() {
    const json = {
      Einri: this.storageService.einri,
      Falnr: this.storageService.falnr,
      Lfdnr: this.storageService.lfdnr,
    }
    this.emergencyService.getPhyAssessment(json).subscribe(
      (_success: any) => {
        this.phyDocList = _success.d.results;
      },
      (_error: any) => { }
    );
  }
  removeDuplicates(array: any[]): any[] {
    return [...new Set(array)];
  }
  getPatientProfile() {
    this.admissionService.getDicumentDetails(this.storageService.einri, '1', this.storageService.patnr, '', this.storageService.falnr).subscribe({
      next: (_success: any) => {
        // Handle successful data retrieval
        this.documentTypeFilterValueClone = _success.d.results;
        // this.documentTypeFilterValue = _success.d.results;
        this.filterByPeriod();
        this.sort();
        this.createdDocumentUserList = this.documentTypeFilterValueClone.map(item => item.MitarbName);
          this.createdDocumentUserList = this.removeDuplicates(this.createdDocumentUserList);
          this.departmentOUList = this.documentTypeFilterValueClone.map(item => item.Orgdo);
          this.departmentOUList = this.removeDuplicates(this.departmentOUList);
        if (this.documentTypeFilterValue.length) {
          this.documentTypeFilterValue.forEach((element) => {
            let checkPatinet = this.documentTypeFilter.find(el => el.Dtid === element.Dtid);
            if (!checkPatinet) {
              this.documentTypeFilter.push({
                Dtid: element.Dtid,
                DtidText: element.DtidText
              })
            }
          })
        }
      },
      error: (err: any) => {
        // Handle errors if the request fails
        console.error('Error Data:', err);
        // this.sharedService.waringSwallModel(`GET Error : ${err}`);
      },
    });
  }

  groupBy(array: any[], key: string): any {
    return array.reduce((result, currentValue) => {
      (result[currentValue[key]] = result[currentValue[key]] || []).push(currentValue);
      return result;
    }, {});
  }
  async create() {
    (await this.phyComp.createPhyDoc()).subscribe((res: any) => {
      Swal.fire({
        text: "Document is created successfully",
        icon: 'success',
        confirmButtonText: 'Ok',
        customClass: { popup: 'myalertpopup' }
      } as any)
      this.phyComp.resetAll();
      this.refresh();
    }, (_error: any) => { 
       Swal.fire({
        text: _error.error.error?.message?.value,
        icon: 'error',
        confirmButtonText: 'Ok',
        customClass: { popup: 'myalertpopup' }
      } as any)
    });
  }
  async update() {
    (await this.phyComp.updatePhyDoc()).subscribe((res: any) => {
      Swal.fire({
        text: "Document is updated successfully",
        icon: 'success',
        confirmButtonText: 'Ok',
        customClass: { popup: 'myalertpopup' }
      } as any)
      this.phyComp.resetAll();
      this.refresh();
    }, (_error: any) => { 
       Swal.fire({
        text: _error.error.error?.message?.value,
        icon: 'error',
        confirmButtonText: 'Ok',
        customClass: { popup: 'myalertpopup' }
      } as any)
    });
  }
  async release() {
    (await this.phyComp.releasePhyDoc()).subscribe((res: any) => {
      Swal.fire({
        text: "Document is released successfully",
        icon: 'success',
        confirmButtonText: 'Ok',
        customClass: { popup: 'myalertpopup' }
      } as any)
      this.phyComp.resetAll();
      this.refresh();
    }, (_error: any) => { 
       Swal.fire({
        text: _error.error.error?.message?.value,
        icon: 'error',
        confirmButtonText: 'Ok',
        customClass: { popup: 'myalertpopup' }
      } as any)
    });
  }
  async delete() {
    Swal.fire({
      title: 'Confirm',
      text: 'Do you want to delete?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes',
      cancelButtonText: 'No',
      customClass: { popup: 'myalertpopup' }
    } as any).then(async (result) => {
      if (result.value) {

        (await this.phyComp.deletePhyAssessment()).subscribe(
          (_success: any) => {
            Swal.fire({
              text: "Document is deleted successfully",
              icon: 'success',
              confirmButtonText: 'Ok',
              customClass: { popup: 'myalertpopup' }
            } as any)
            this.phyComp.resetAll();
            this.refresh();
          },
          (_error: any) => { 
              this.docsService.showErrorMsg(_error);
          }
        );
      }
    });
  }
  async createCopy() {
    (await this.phyComp.copyPhyDoc()).subscribe((res: any) => {
      Swal.fire({
        text: "Document is created successfully",
        icon: 'success',
        confirmButtonText: 'Ok',
        customClass: { popup: 'myalertpopup' }
      } as any)
      this.phyComp.resetAll();
      this.refresh();
    }, (_error: any) => { 
        Swal.fire({
              text: _error.error.error?.message?.value,
              icon: 'error',
              confirmButtonText: 'Ok',
              customClass: { popup: 'myalertpopup' }
            } as any)
    });
  }
  // Create (or copy) a draft, then release the newly-created document. The release
  // targets the Dockey returned by SAP in the create/copy response, so it works
  // even though the form still holds the previous (or empty) Dockey. This replaces
  // the old refresh+actionType chaining, which reset actionType synchronously before
  // the async release could fire (so direct release never actually released).
  private async createOrCopyThenRelease(build: () => Promise<any>) {
    this.actionType = '';
    const createObs = await build();
    // createPhyDoc/copyPhyDoc return undefined when mandatory-field validation
    // fails (they show their own alert), so guard before subscribing.
    if (!createObs) { return; }
    createObs.subscribe(async (res: any) => {
      const newDockey = res?.d?.Dockey;
      if (newDockey) {
        this.phyComp.PhyAssessmentForm.controls.Dockey.setValue(newDockey);
      }
      (await this.phyComp.releasePhyDoc()).subscribe((_res: any) => {
        Swal.fire({
          text: "Document is created and released successfully",
          icon: 'success',
          confirmButtonText: 'Ok',
          customClass: { popup: 'myalertpopup' }
        } as any)
        this.phyComp.resetAll();
        this.refresh();
      }, (_error: any) => {
        Swal.fire({
          text: _error.error.error?.message?.value,
          icon: 'error',
          confirmButtonText: 'Ok',
          customClass: { popup: 'myalertpopup' }
        } as any)
      });
    }, (_error: any) => {
      Swal.fire({
        text: _error.error.error?.message?.value,
        icon: 'error',
        confirmButtonText: 'Ok',
        customClass: { popup: 'myalertpopup' }
      } as any)
    });
  }
  async createAndRelease() {
    await this.createOrCopyThenRelease(() => this.phyComp.createPhyDoc());
  }
  async copyAndRelease() {
    await this.createOrCopyThenRelease(() => this.phyComp.copyPhyDoc());
  }
  openReleasePdf(id) {
    this.pdfUrl = '';
    this.getReleasedDoc(id);
  }
  getReleasedDoc(id) {
    const json = {
      Dockey: id
    }
    this.emergencyService.getReleasedPdf(json).subscribe(
      (_success: any) => {
        if (_success) {
          this.pdfUrlType = 'pdf';
          const config: ModalOptions = {
            class: 'modal-dialog-centered modal-xl pdfmodal-size',
          };
          this.modalRef = this.modalService.show(this.releasepdfmodal, config);
          this.pdfUrlConvertToBlob(_success?.d?.AttachmentData);
          // this.pdfUrl=this.sanitizer.bypassSecurityTrustResourceUrl('data:application/pdf;base64,'+ _success?.d?.AttachmentData);
        }
      },
      (_error: any) => { }
    );
  }

  onReleaseHistoryData(releaseId: any, item) {
    this.seletcedCurrentDoc = item;
    this.inPatientVisitData = {} as InPatientDataResult;
    this.patientVisitRecord = {} as PatientVisitDataResult;
    this.admissionService
      .getReleaseHistoryData(releaseId, this.paramsObject.einri)
      .subscribe((data) => {
        if (data && data.length) {
          this.diagnosisHistory.showPopup(data, item);
        }
      });
  }

  onOpenAttachment(attachmentId: any) {
    this.inPatientVisitData = {} as InPatientDataResult;
    this.patientVisitRecord = {} as PatientVisitDataResult;
    if (attachmentId.Mimetype == 'PDF' || attachmentId.Mimetype == 'url' || attachmentId.Mimetype == 'image/bmp' || attachmentId.Mimetype == 'HTML') {
      this.admissionService
        .getPatientProfilePDF(attachmentId.DocKey)
        .subscribe((_success: any) => {
          if (_success) {
            this.patientVisitRecord = {
              ..._success,
              DOCCATTOATTACHMENTS: { results: [_success] },
            };

            this.InOutPatientViewValue = {
              showBoth: false,
              showIn: false,
              showOut: true,
            };

            if (attachmentId.Mimetype == 'PDF') {
              this.pdfUrlConvertToBlob(_success.d.AttachmentData);
              console.log(this.pdfUrl, "--");
              this.pdfUrlType = 'pdf';
              this.pdfFormOpen();
            } else if (attachmentId.Mimetype == 'url') {
              window.open(_success.d.Url);
            } else if (attachmentId.Mimetype == 'image/bmp') {
              this.pdfUrlType = 'image';
              this.pdfFormOpen();
              this.releaseDocumentImage = 'data:image/png;base64,' + _success.d.AttachmentData;
            } else if (attachmentId.Mimetype == 'HTML') {
              this.pdfUrlType = 'html';
              this.pdfFormOpen();
              this.htmlData = this.sanitizer.bypassSecurityTrustHtml(_success.d.AttachmentDataStr);
            }
          }
        });
    }
  }

  pdfFormOpen() {
    const config: ModalOptions = {
      class: 'modal-dialog-centered modal-xl pdfmodal-size',
    };
    this.selectedIconPdf = this.modalService.show(this.selectIconPdf, config);
    // this.openRealsePDFModal(this.seletcedCurrentDoc, this.labpdfmodal, '')
    this.pdfFormDiv = true;
  }

  modelFormOpen(value, oldVersion) {

  }

  pdfUrlConvertToBlob(pdfValue) {
    let byteArray = new Uint8Array(atob(pdfValue).split("").map(char => char.charCodeAt(0)));
    let file = new Blob([byteArray], { type: "application/pdf" });
    const objectUrl = URL.createObjectURL(file);
    // Sanitize the object URL and assign it to the pdfUrl
    this.pdfUrl = this.sanitizer.bypassSecurityTrustResourceUrl(objectUrl);
  }
  refresh() {
    this.getLatestAssessment();
    this.getPhyAssessment();
    this.getMedLatestAssessment();
    this.getEducationAssessment();
    this.getCorrespondenceDocDetails();
    this.phyAssess = false;
    this.nursAssess = false;
    this.educationAssessment = false;
    this.openEducationAssessment = false;
    this.medReport = false;
    this.openPhyAssess = false;
    this.openMedReport = false;
    this.searchString = '';
    this.dateRange = '';
    this.documentType = undefined;
    this.patientProfileDocumet = this.documentTypeFilterValue;
    this.isCorrespondenceDocument = false;
    this.openCorrespondenceDocument = false;
    this.medDocList = [];
  }
  // Validates a toolbar action against the selected document's status and, when
  // blocked, shows an explanatory popup. Mirrors the lifecycle: edit/release/delete
  // need a Draft, copy needs a Released doc, and create is blocked while a Draft
  // exists (or a Released ER Physician doc, which must be Copied to a new version).
  documentActionAllowed(action): boolean {
    const status = this.selectedDocData?.StatusTxt;
    const info = (text: string) => {
      Swal.fire({
        text,
        icon: 'info',
        confirmButtonText: 'Ok',
        customClass: { popup: 'myalertpopup' }
      } as any);
      return false;
    };
    if (action == 'create') {
      if (status == 'Draft') {
        return info('A draft already exists. Please release or delete it before creating a new document.');
      }
      if (status == 'Released' && this.phyAssess) {
        return info('This document is released. Use Copy to create a new version.');
      }
    } else if (action == 'edit') {
      if (status != 'Draft') { return info('Only draft documents can be edited.'); }
    } else if (action == 'release') {
      if (status != 'Draft') { return info('Only draft documents can be released.'); }
    } else if (action == 'delete') {
      if (status != 'Draft') { return info('Only draft documents can be deleted.'); }
    } else if (action == 'copy') {
      if (status != 'Released') { return info('Only released documents can be copied.'); }
    }
    return true;
  }
  openDocument(action) {
    // Lifecycle guard: the document is a single versioned record per case
    // (Draft -> Released -> Copy -> next version). Explain, via a popup, why a
    // button click is blocked instead of silently doing nothing.
    if (!this.documentActionAllowed(action)) {
      return;
    }
    this.actionType = action;
    if (this.phyAssess) {
      if (action == 'create') {
        this.openPhyAssess = true;
        this.phyComp.resetAll();
        this.phyComp.ngOnInit();

      } else if (action == 'edit') {
        this.openPhyAssess = true;
        this.phyComp.ngOnInit();
      }
      else if (action == 'delete') {
        this.phyComp.ngOnInit();
        this.delete();
      } else if (action == 'release') {
        this.phyComp.ngOnInit();
        this.release();
      } else if (action == 'copy') {
        this.openPhyAssess = true;
        this.phyComp.ngOnInit();
      } else if (action == 'createandrelease') {
        this.openPhyAssess = true;
        this.phyComp.ngOnInit();
        this.createAndRelease();
      }
    } else if (this.medReport) {
      if (action == 'create') {
        this.openMedReport = true;
        this.medComp.resetAll();
        this.medComp.ngOnInit();

      } else if (action == 'edit') {
        this.openMedReport = true;
        this.medComp.ngOnInit();
      } else if (action == 'delete') {
        this.medComp.ngOnInit();
        this.deleteMedReport();
      } else if (action == 'release') {
        this.medComp.ngOnInit();
        this.releaseMed();
      } else if (action == 'copy') {
        this.openMedReport = true;
        this.medComp.ngOnInit();
      } else if (action == 'createandrelease') {
        this.openMedReport = true;
        this.medComp.ngOnInit();
        this.createAndReleaseMed();
      }
    } else if (this.educationAssessment) {
      if (action == 'create') {
        this.openEducationAssessment = true;
        this.educationAssList = [];
        // this.educationAssessmentComp.resetAll();
         // this.educationAssessmentComp.ngOnInit();

      } else if (action == 'edit') {
        this.openEducationAssessment = true;
        // this.educationAssessmentComp.ngOnInit();
      } else if (action == 'delete') {
        // this.educationAssessmentComp.ngOnInit();
        this.deleteEducationAss();
      } else if (action == 'release') {
        this.releaseEducationAss()
        // this.educationAssessmentComp.ngOnInit();
        // this.releaseMed();
      } else if (action == 'copy') {
        this.openEducationAssessment = true;
        // this.educationAssessmentComp.ngOnInit();
      } else if (action == 'createandrelease') {
        this.openEducationAssessment = true;
        this.educationAssessmentComp.saveAndReleaseEducation(false);
        // this.educationAssessmentComp.ngOnInit();
        // this.createAndReleaseMed();
      }
    }
    else if (this.attachments) {
      if (action == 'create') {
        this.openModalForAttachment();
      }
    } else if (this.isCorrespondenceDocument) {
      if (action == 'create') {
        this.openCorrespondenceDocument = true;
        // this.educationAssessmentComp.resetAll();
        // this.educationAssessmentComp.ngOnInit();

      } else if (action == 'edit') {
        this.openCorrespondenceDocument = true;
        // this.educationAssessmentComp.ngOnInit();
      } else if (action == 'delete') {
        // this.educationAssessmentComp.ngOnInit();
        this.deleteCorrespondenceDoc(this.selectedDocData.Dockey);
      } else if (action == 'release') {
        this.directReleaseCorrespondenceDoc()
        // this.educationAssessmentComp.ngOnInit();
        // this.releaseMed();
      } else if (action == 'copy') {
        this.openCorrespondenceDocument = true;
        // this.educationAssessmentComp.ngOnInit();
      } else if (action == 'createandrelease') {
        this.openCorrespondenceDocument = true;
        this.CorrespondenceComp.createCorrespondenceDocument('4').then((formValue) => {
          if (formValue) {
            this.refresh()
            this.actionType = "";
          }
        }).catch((error: any) => {
          console.error('Error scale:', error);
          console.error('Error creating CPR document:', error);
        });
        // this.educationAssessmentComp.ngOnInit();
        // this.createAndReleaseMed();
      }
    }
  }
async deleteCorrespondenceDoc(docKey: string) {
    Swal.fire({
      title: 'Confirm',
      text: 'Do you want to delete?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes',
      cancelButtonText: 'No',
      customClass: { popup: 'myalertpopup' }
    } as any).then(async (result) => {
      if (result.value) {
        (await this.dayCaseDashboardService.deleteCorrespondenceDocument(docKey)).subscribe(
          (_success: any) => {
            Swal.fire({
              text: "Document is deleted successfully",
              icon: 'success',
              confirmButtonText: 'Ok',
              customClass: { popup: 'myalertpopup' }
            } as any)
            this.refresh();
          },
          (_error: any) => {
            Swal.fire({
              text: `${_error.error.error.innererror?.errordetails[0]?.message}`,
              icon: 'warning',
              confirmButtonText: 'Ok',
              customClass: { popup: 'myalertpopup' }
            } as any)
            this.refresh();
          }
        );
      }
    });
  }

  directReleaseCorrespondenceDoc() {
    this.subscription = this.dayCaseDashboardService
      .fetcCorrespondenceSetDocDetails(this.selectedDocData.Dockey).subscribe({
        next: (data: any) => {
          let paylaod = data.d.results[0];
          delete paylaod.__metadata
          paylaod.DocStatus = '2';
          this.subscription = this.dayCaseDashboardService.saveCorrespondenceDocument({ d: paylaod }).subscribe({
            next: (data: any) => { },
            error: (err: any) => {
              this.sharedService.waringSwallModel(`Error ${err}`);
              this.sharedService.waringSwallModel(`POST Error at Nurse Endorsment : ${err}`);
            },
            complete: () => {
              this.sharedService.successSwallModel('CPR Document released successfully');
              this.refresh();
            }
          });
        },
        error: (err: any) => {
          this.docsService.showErrorMsg(err);
        }
      });
  }
  public openModalForAttachment() {
    const config: ModalOptions = { class: 'modal-dialog-centered attachment-modal' };
    this.removeFile();
    this.getAttachmentsList();
    this.createAttachmentForm.reset();
    this.modalRef = this.modalService.show(this.attachmentModal, config);
    this.modalRefForStrucDoc.hide();
    this.userProfile = this.storageService.getUserProfile();
    this.modalRef.onHide.subscribe((reason: string | any) => {
      if (reason === 'backdrop-click') {
      }
    });

  }

  filterPeriodDate() {
    this.filterByPeriod();
    this.sort();
  }

  filterByPeriod() {
    let currentDate = new Date();
    let startOfDay = new Date(currentDate.setHours(0, 0, 0, 0));
    let yesterday = new Date(startOfDay);
    yesterday.setDate(startOfDay.getDate() - 1);
  
    let filteredArray = [];
    
    switch (this.previousPeriodValue) {
      case "Current Day":
        filteredArray = this.documentTypeFilterValueClone.filter(item => this.isSameDate(this.parseODataDate(item.Dodat), startOfDay));
        break;
      case "Since Yesterday":
        filteredArray = this.documentTypeFilterValueClone.filter(item => this.parseODataDate(item.Dodat) >= yesterday);
        break;
      case "In Past 3 Days":
        let past3Days = new Date(startOfDay);
        past3Days.setDate(startOfDay.getDate() - 3);
        filteredArray = this.documentTypeFilterValueClone.filter(item => this.parseODataDate(item.Dodat) >= past3Days);
        break;
      case "In Past Week":
        let pastWeek = new Date(startOfDay);
        pastWeek.setDate(startOfDay.getDate() - 7);
        filteredArray = this.documentTypeFilterValueClone.filter(item => this.parseODataDate(item.Dodat) >= pastWeek);
        break;
      case "In Past Month":
        let pastMonth = new Date(startOfDay);
        pastMonth.setMonth(startOfDay.getMonth() - 1);
        filteredArray = this.documentTypeFilterValueClone.filter(item => this.parseODataDate(item.Dodat) >= pastMonth);
        break;
      case "In Past Years":
        let pastYear = new Date(startOfDay);
        pastYear.setFullYear(startOfDay.getFullYear() - 1);
        filteredArray = this.documentTypeFilterValueClone.filter(item => this.parseODataDate(item.Dodat) >= pastYear);
        break;
      case "Overall":
        filteredArray = this.documentTypeFilterValueClone; // No filtering needed
        break;
      default:
        filteredArray = this.documentTypeFilterValueClone; // No filtering needed
    }

    // Filter based on the selected options
    this.documentTypeFilterValue = filteredArray.filter((item) => {
      const itemDate = new Date(parseInt(item.Dodat.match(/\d+/)[0]));
      const isDateInRange = itemDate >= currentDate;

      const isCreatedByMatch =
        !this.selectedCreatedBy || item.MitarbName === this.selectedCreatedBy;

      const isDepartmentMatch =
        !this.selectedDocumentOU || item.Orgdo === this.selectedDocumentOU;

      return isCreatedByMatch && isDepartmentMatch;
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

  getAttachmentsList() {
    this.patientHistoryService.getAttachmentsList().subscribe(
      (_success: any) => {
        this.attachmentList = _success.d.results;

      },
      (_error: any) => { }
    );
  }

  resetAttachment() {
    this.modalRef.hide();
    this.createAttachmentForm.reset();
  }

  handleFileChange(event) {
    this.file = event.target.files[0];
    this.filename = event.target.files[0].name;
    this.mimetype = event.target.files[0].type;
    this.convertFile(event.target.files[0]).subscribe((base64) => {
      this.base64Value = base64;
    });
  }
  removeFile() {
    this.file = null;
    this.filename = '';
    this.mimetype = '';
    this.base64Value = '';
  }

  onFileSelected(template: TemplateRef<any>): void {
    this.uploadDocument(template);
  }
  uploadDocument(template) {
    if (this.file) {
      const config: ModalOptions = { class: 'document' };
      this.modalService.show(template, config);
      const fileReader = new FileReader();
      fileReader.onload = (e) => {
        this.documentUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
          ((e.target as FileReader).result as string)
        );
      };
      fileReader.readAsDataURL(this.file);
    }
  }

  convertFile(file: File): Observable<string> {
    const result = new ReplaySubject<string>(1);
    const reader = new FileReader();
    reader.readAsBinaryString(file);
    reader.onload = (event) =>
      result.next(btoa(event.target.result.toString()));
    return result;
  }


  createAttachmentDoc() {
    this.createAttachmentForm.markAllAsTouched();
    if (this.createAttachmentForm.valid) {
      const json = {
        "DocNr": "",
        "Version": "",
        "Dtid": "ZMED_ATCHM",
        "Einri": this.storageService.einri,
        "Patnr": this.storageService.patnr,
        "Falnr": this.storageService.falnr,
        "Orgdo": this.storageService.patientData.deptOrgUnit,
        "AttendPhy": this.storageService.getUserProfile().Gpart,
        "DocType": this.createAttachmentForm.controls.attachmentType.value,
        "FileName": this.filename,
        "Mimetype": this.mimetype,
        "AttachmentDataStr": this.base64Value
      }
      this.patientHistoryService.createAttachmentDoc(json).subscribe(
        (_success: any) => {
          this.resetAttachment();
          this.createAttachmentForm.reset();
          Swal.fire({
            title: 'Created Successfully',
            icon: 'success',
            confirmButtonText: 'OK',
          }).then(() => {
            this.file = null;
            this.filename = '';
            this.mimetype = '';
            this.base64Value = '';
            // this.inPatientConfigurationService.getListOfAllPatientVisitDataSet();
            this.userconfig.getListOfPatientVisitDataSet()
          });
        },
        (_error: any) => {
          this.showErrorPopup("", _error.error.error.message.value, "Error")
        }
      );
    }
  }

  showErrorPopup(title: any, text: any, messageType) {
    return Swal.fire({
      title: title ? title : '',
      text: text ? text : '',
      showCancelButton: messageType === 'Conform' ? true : false,
      confirmButtonColor: '#0890c5',
      cancelButtonColor: '#84898c',
      confirmButtonText: messageType === 'Error' ? 'Close' : 'Yes',
      cancelButtonText: 'No',
      customClass: { popup: 'myalertpopup' },
      icon: 'error'
    } as any);
  }

  reloadDoc(event) {
    this.refresh();
  }
  saveDoc() {
    if (this.actionType == 'create') {
      this.create();
    } else if (this.actionType == 'edit') {
      this.update();
    } else if (this.actionType == 'copy') {
      this.createCopy();
    }
  }
  releaseFromForm() {
    if (this.phyAssess) {
      this.release();
    } else if (this.medReport) {
      this.releaseMed();
    } else if (this.educationAssessment) {
      this.createEducationAss(true);
    }  else if (this.openCorrespondenceDocument) {
      this.CorrespondenceComp.createCorrespondenceDocument('2', 'edit').then((formValue: any) => {
        if (formValue) {
          this.refresh();
        }
      }).catch((error: any) => {
        console.error('Error scale:', error);
        console.error('Error creating CPR Document:', error);
      });
    } 

  }
  getReleasedPdf(item) {
    if (item.AttMimeType == 'PDF' || item.AttMimeType == 'url' || item.AttMimeType == 'image/bmp' || item.AttMimeType == 'HTML') {
      this.admissionService.getPatientProfilePDF(item.Dockey).subscribe((_success: any) => {
        if (item.AttMimeType == 'PDF') {
          // this.pdfUrl = this.sanitizer.bypassSecurityTrustResourceUrl('data:application/pdf;base64,' + _success.d.AttachmentData);
          const config: ModalOptions = {
            class: 'modal-dialog-centered modal-xl pdfmodal-size',
          };
          this.modalRef = this.modalService.show(this.releasepdfmodal, config);
          this.pdfUrlConvertToBlob(_success?.d?.AttachmentData);
          this.pdfUrlType = 'pdf';
        } else if (item.AttMimeType == 'url') {
          window.open(_success.d.Url);
        } else if (item.AttMimeType == 'image/bmp') {
          const config: ModalOptions = {
            class: 'modal-dialog-centered modal-xl pdfmodal-size',
          };
          this.releaseDocumentImage = 'data:image/png;base64,' + _success.d.AttachmentData;
          this.modalRef = this.modalService.show(this.releasepdfmodal, config);
          this.pdfUrlType = 'image';
        } else if (item.AttMimeType == 'HTML') {
          const config: ModalOptions = {
            class: 'modal-dialog-centered modal-xl pdfmodal-size',
          };
          this.modalRef = this.modalService.show(this.releasepdfmodal, config);
          this.htmlData = this.sanitizer.bypassSecurityTrustHtml(_success.d.AttachmentDataStr);
          this.pdfUrlType = 'html';
        }
        // this.pdfUrl=this.sanitizer.bypassSecurityTrustResourceUrl('data:application/pdf;base64,'+ _success.d.AttachmentData);
        // const config: ModalOptions = {
        //   class: 'modal-dialog-centered modal-xl pdfmodal-size',
        // };
        // this.modalRef = this.modalService.show(this.releasepdfmodal, config);
      });
    }
  }

  sortedDocuments: any;
  sort() {

    this.patientProfileDocumet = this.groupBy(this.documentTypeFilterValue, 'Dodat');

    this.sortedDocuments = Object.keys(this.patientProfileDocumet).map(key => ({
      date: new Date(parseInt(key.replace('/Date(', '').replace(')/', ''))),
      documents: this.patientProfileDocumet[key]
    }));

    // Sort the array based on the date property
    if (this.asc) {
      this.asc = false;
      this.desc = true;
      this.sortedDocuments.sort((a, b) => b.date - a.date);
    } else {
      this.asc = true;
      this.desc = false;
      this.sortedDocuments.sort((a, b) => a.date - b.date);
    }
    console.log(this.sortedDocuments, "--");

    // this.documentTypeFilterValue.sort((a, b) => 0 - (a > b ? -1 : 1));
    // console.log(this.patientProfileDocumet, "this.patientProfileDocumet");
  }

  jsonString() {
    return JSON.stringify(this.patientProfileDocumet);
  }
  getPatientProfileData(item) {
    this.getReleasedPdf(item);
    // if (item.AttMimeType !== '' && item.Dtid == 'ZMED_SOAP') {
    //   this.openSoapDetails(item);
    // }else{
    // }
  }
  openSoapDetails(item) {
    this.userConfigurationService
      .getSoapPatientdata(
        item.Dockey,
        item.Einri,
        this.storageService.falnr
      ).subscribe((_success: any) => {
        this.PatientData = _success?.d?.results[0];
        this.PatientData['VisitDate'] = this.getDate(this.PatientData?.Visitdate);
        const config: ModalOptions = {
          class: 'modal-dialog-centered modal-xl soap-modal',
        };
        this.modalRef = this.modalService.show(this.notreleasedmodal, config);
      })

  }
  // Med report
  getMedLatestAssessment() {
    const json = {
      Einri: this.storageService.einri,
      Falnr: this.storageService.falnr,
      Patnr: this.storageService.patnr,
      Lfdnr: this.storageService.lfdnr
    }
    this.emergencyService.getMedLatestAssessment(json).subscribe(
      (_success: any) => {
        this.medlatestDocList = [];
        if (_success?.d?.results.length > 0) {
          this.medlatestDocList = _success?.d?.results;
          if (this.actionType == 'createandrelease' && this.medReport) {
            this.medComp.ngOnInit();
            this.releaseMed();
          }
          this.getMedReportData();
        }
        //  if (this.actionType == 'createandrelease') {
        //   this.phyComp.ngOnInit();
        //   this.release();
        //  }
      },
      (_error: any) => { }
    );
  }
  saveMedDoc() {
    if (this.actionType == 'create') {
      this.createMedDoc();
    } else if (this.actionType == 'edit') {
      this.updateMedDoc();
    } else if (this.actionType == 'copy') {
      this.CopyMedReport();
    }
  }

  saveEducationAss() {
    if (this.actionType == 'create') {
      this.createEducationAss(false);
    } else if (this.actionType == 'edit') {
      this.updateEducationAss(false);
    } else if (this.actionType == 'copy') {
      this.createEducationAss(false);
    }
  }
  getMedReportData() {
    const json = {
      Dockey: this.medlatestDocList[0].Dockey
    }
    this.emergencyService.getMedReportData(json).subscribe(
      (_success: any) => {
        this.medDocList = _success.d.results;
      },
      (_error: any) => { }
    );
  }
  async createMedDoc() {
    (await this.medComp.createMedDoc()).subscribe((res: any) => {
      Swal.fire({
        text: "Document is created successfully",
        icon: 'success',
        confirmButtonText: 'Ok',
        customClass: { popup: 'myalertpopup' }
      } as any)
      this.medComp.resetAll();
      this.refresh();
    }, (_error: any) => {
        this.docsService.showErrorMsg(_error);
     });
  }
  async deleteMedReport() {
    Swal.fire({
      title: 'Confirm',
      text: 'Do you want to delete?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes',
      cancelButtonText: 'No',
      customClass: { popup: 'myalertpopup' }
    } as any).then(async (result) => {
      if (result.value) {

        (await this.medComp.deleteMedReport()).subscribe(
          (_success: any) => {
            Swal.fire({
              text: "Document is deleted successfully",
              icon: 'success',
              confirmButtonText: 'Ok',
              customClass: { popup: 'myalertpopup' }
            } as any)
            this.medComp.resetAll();
            this.refresh();
          },
          (_error: any) => { 
            this.docsService.showErrorMsg(_error);
          }
        );
      }
    });
  }
  async updateMedDoc() {
    (await this.medComp.updateMedDoc()).subscribe((res: any) => {
      Swal.fire({
        text: "Document is updated successfully",
        icon: 'success',
        confirmButtonText: 'Ok',
        customClass: { popup: 'myalertpopup' }
      } as any)
      this.medComp.resetAll();
      this.refresh();
    }, (_error: any) => { 
        this.docsService.showErrorMsg(_error);
    });
  }
  async releaseMed() {
    (await this.medComp.releaseMedDoc()).subscribe((res: any) => {
      Swal.fire({
        text: "Document is released successfully",
        icon: 'success',
        confirmButtonText: 'Ok',
        customClass: { popup: 'myalertpopup' }
      } as any)
      this.medComp.resetAll();
      this.refresh();
    }, (_error: any) => { 
        this.docsService.showErrorMsg(_error);
    });
  }
  getMedReleasedDoc(id) {
    const json = {
      Dockey: id
    }
    this.emergencyService.getMedReleasedPdf(json).subscribe(
      (_success: any) => {
        if (_success) {
          this.pdfUrlType = 'pdf';
          this.pdfUrlConvertToBlob(_success?.d?.AttachmentData);
          // this.pdfUrl=this.sanitizer.bypassSecurityTrustResourceUrl('data:application/pdf;base64,'+ _success?.d?.AttachmentData);
          const config: ModalOptions = {
            class: 'modal-dialog-centered modal-xl pdfmodal-size',
          };
          this.modalRef = this.modalService.show(this.releasepdfmodal, config);
        }
      },
      (_error: any) => { }
    );
  }
  async CopyMedReport() {
    (await this.medComp.CopyMedReport()).subscribe((res: any) => {
      Swal.fire({
        text: "Document is created successfully",
        icon: 'success',
        confirmButtonText: 'Ok',
        customClass: { popup: 'myalertpopup' }
      } as any)
      this.phyComp.resetAll();
      this.refresh();
    }, (_error: any) => { 
        this.docsService.showErrorMsg(_error);
    });
  }
  async createAndReleaseMed() {
    (await this.medComp.createMedDoc()).subscribe((res: any) => {
      this.medComp.resetAll();
      this.refresh();
    }, (_error: any) => {
        this.docsService.showErrorMsg(_error);
    });
    // Clear the create-and-release flag synchronously (mirrors phy createAndRelease)
    // so the async refresh -> getLatestAssessment does not re-trigger a release loop.
    this.actionType = this.actionType == 'createandrelease' ? 'create' : '';
  }
  openMedReleasePdf(id) {
    this.pdfUrl = '';
    this.getMedReleasedDoc(id);
  }

  // Education Assessment
  getEducationAssessment() {
    const json = {
      Einri: this.storageService.einri,
      Falnr: this.storageService.falnr,
      Patnr: this.storageService.patnr,
      Lfdnr: this.storageService.lfdnr
    }
    this.emergencyService.getEduAssesLatestDocSet(json).subscribe(
      (_success: any) => {
        this.educationAssList = _success.d.results;
        // Guard by the active form: app-education-form is *ngIf, so this runs only
        // when the education flow is active (otherwise educationAssessmentComp is
        // undefined -> "reading 'ngOnInit'" crash, and this.release() loops).
        if (this.actionType == 'createandrelease' && this.educationAssessment) {
          this.educationAssessmentComp.ngOnInit();
          this.release();
        }
      },
      (_error: any) => { }
    );
  }
  async createEducationAss(type) {
    (await this.educationAssessmentComp.saveEducationFormValue(type)).subscribe((res: any) => {
      Swal.fire({
        text: "Education assessment is created successfully",
        icon: 'success',
        confirmButtonText: 'Ok',
        customClass: { popup: 'myalertpopup' }
      } as any)
      this.educationAssessmentComp.resetAll();
      this.refresh();
    }, (_error: any) => { 
        this.docsService.showErrorMsg(_error);
    });
  }

  async deleteEducationAss() {
    Swal.fire({
      title: 'Confirm',
      text: 'Do you want to delete?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes',
      cancelButtonText: 'No',
      customClass: { popup: 'myalertpopup' }
    } as any).then(async (result) => {
      if (result.value) {

        (await this.admissionService
          .deleteEducationDetails(this.educationAssList[0].Dockey)).subscribe(
            (_success: any) => {
              Swal.fire({
                text: "Document is deleted successfully",
                icon: 'success',
                confirmButtonText: 'Ok',
                customClass: { popup: 'myalertpopup' }
              } as any)
              this.refresh();
            },
            (_error: any) => {
              this.docsService.showErrorMsg(_error);
             }
          );
      }
    });
  }

  async updateEducationAss(type) {
    (await this.educationAssessmentComp.saveEducationFormValue(type)).subscribe((res: any) => {
      Swal.fire({
        text: "Document is updated successfully",
        icon: 'success',
        confirmButtonText: 'Ok',
        customClass: { popup: 'myalertpopup' }
      } as any)
      this.educationAssessmentComp.resetAll();
      this.refresh();
    }, (_error: any) => { 
        this.docsService.showErrorMsg(_error);
    });
  }

  releaseEducationAss() {
    this.admissionService.getDocuEducationDetails(this.educationAssList[0].Dockey).subscribe((res: any) => {
      console.log(res, "--");

      let d: any = {
        d: res?.d?.results[0],
      };
      d.d.DocStatus = '2';
      this.admissionService.saveEducationData(d).subscribe(
        (result) => {
          this.refresh();
        }
      );
    })
  }

  openEducationAssPdf(Dockey) {
    this.pdfUrl = '';
    this.admissionService
      .getEducationPDF(Dockey)
      .subscribe((data: any) => {
        this.pdfUrlType = 'pdf';
        this.pdfUrlConvertToBlob(data?.d?.AttachmentData);
        // this.pdfUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
        //   'data:application/pdf;base64,' + data.d.AttachmentData
        // );
        const config: ModalOptions = {
          class: 'modal-dialog-centered modal-xl pdfmodal-size',
        };
        this.modalRef = this.modalService.show(this.releasepdfmodal, config);
      });
  }

  dockVer(value) {
    return `(v${parseInt(value)})`;
  }

  // The history popup lists previous releases only, so the version control is
  // hidden for a first version or a document without a usable version number.
  hasPreviousVersions(document: any): boolean {
    return hasPreviousDocumentVersions(document);
  }

  closePdfModal() {
    this.releaseDocumentImage = '';
    this.modalRef.hide();
  }
}
