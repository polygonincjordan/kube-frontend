import {
  Component,
  Input,
  OnInit,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { DomSanitizer, SafeHtml, SafeResourceUrl } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { AdmissionService } from '@services/admission/admission.service';
import { InPatientConfigurationService } from '@services/e-kardex/inPatient.service';
import { InPatientDataResult } from '@services/e-kardex/interfaces/inpatient-data';
import { PatientVisitDataResult } from '@services/e-kardex/interfaces/patient-visit-data';
import { UserConfig } from '@services/e-kardex/interfaces/user-config';
import { UserConfigurationService } from '@services/e-kardex/user-configuration.service';
import { EmergencyService } from '@services/emergency-dashboard/emergency-service';
import { BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
import { BsModalRef, BsModalService, ModalOptions } from 'ngx-bootstrap/modal';
import { Observable, ReplaySubject, catchError, of } from 'rxjs';
import { DiagnosisHistoryPopupComponent } from 'src/app/e-kardex/diagnoses/dignosis-history-popup/diagnosis-history-popup.component';
import { DatePipe } from '@angular/common';
import Swal from 'sweetalert2';
import { StorageService } from '@services/storage.service';
import { FormControl, FormGroup, Validators, FormBuilder } from '@angular/forms';
import { PatientHistoryService } from '@services/e-kardex/patient-history.service';
import { DayCaseDashboardService } from '@services/day-case.dashboard/day-case-dashboard.service';
import { NeonatalDischDocumentComponent } from 'src/app/shared-module/neonatal-disch-document/neonatal-disch-document.component';
@UntilDestroy()
@Component({
  selector: 'app-documentation-list',
  templateUrl: './documentation-list.component.html',
  styleUrls: ['./documentation-list.component.scss'],
})
export class DocumentationListComponent implements OnInit {
  @ViewChild(NeonatalDischDocumentComponent) NeonatalDischDocumentComp: NeonatalDischDocumentComponent;
  @ViewChild('diagnosisHistory', { static: true })
  diagnosisHistory: DiagnosisHistoryPopupComponent;
  @ViewChild('selectIconPdf', { static: true }) selectIconPdf: TemplateRef<any>;
  @ViewChild('currentDocPdfVer', { static: true }) currentDocPdfVer: TemplateRef<any>;
  @ViewChild('attachmentmodal') attachmentModal: any;
  @ViewChild('pmdDocumentHTML') pmdDocumentHTML: any;
  modalRef: BsModalRef;
  @Input() searchString: string;
  @Input() soapFormEvent: string = '';
  @Input() filterDateValue: string;
  @Input() isDocumentTypeFilter: boolean;
  @Input() isExpanded;
  currentVisitDocumet: any = [];
  currentVisitDocumetClone: any = [];
  patientProfileDocumet: any = [];
  documentTypeFilter = [];

  selectItemValue: any;
  InOutPatientViewValue: any = {
    showBoth: true,
    showIn: false,
    showOut: false,
  };
  paramsObject: any;
  filterDate: any = '';
  selectedIndex: any;
  pdfUrl: any;
  bsConfig: Partial<BsDatepickerConfig> = {
    showWeekNumbers: false,
    dateInputFormat: 'DD/MM/YYYY',
    containerClass: 'document-education-class',
  };
  pdfTemplateRef: BsModalRef;
  selectedIconPdf: BsModalRef;
  currentDocVersionRef: BsModalRef;

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

  documentTypeFilterValue: any[] = [];
  filterFromDate: any;
  filterToDate: any;
  userconfig: UserConfig = {} as UserConfig;
  patientVisitRecord: PatientVisitDataResult = {} as PatientVisitDataResult;
  inPatientVisitData: InPatientDataResult;
  pdfFormDiv: boolean;
  seletcedCurrentDoc: any;
  releaseDocumentImage: any;
  configurationData: any;
  isHtmlView: boolean = false;
  pdfUrlType = ''
  htmlData: any;
  isImageFrame: boolean = false;
  previousPeriodValue: any = 'Overall';
  documentTypeFilterValueClone: any[] = [];
  currentVisitDocumentNameList: any[] = [];
  createdDocumentUserList: any = [];
  departmentOUList = [
    "CARMDAMC", "", "F21IUAMC"
  ];
  selectedCreatedBy: any;
  documentType: any;
  sortedDocuments: any;
  asc: boolean = true;
  desc: boolean = false;
  constructor(
    private patientHistoryService: PatientHistoryService,
    private storageService: StorageService,
    public admissionService: AdmissionService,
    private route: ActivatedRoute,
    public modalService: BsModalService,
    private sanitizer: DomSanitizer,
    private userConfigurationService: UserConfigurationService,
    private inPatientConfigurationService: InPatientConfigurationService,
    private emergencyService: EmergencyService,
    private formBuilder: FormBuilder,
    private dayCaseDashboardService: DayCaseDashboardService,
  ) {
    this.route.queryParams.subscribe((params) => {
      this.paramsObject = params;
    });
    admissionService.isClearSelectedDoc.subscribe((res) => {
      if (res) {
        this.selectedIndex = undefined;
        this.admissionService.isClearSelectedDoc.next(false);
        this.documentFilter('');

      }
    })
    admissionService.document.subscribe((res) => {
      if (res) {
        this.openModalForAttachment();
      }
    });
    // subscription.unsubscribe();
  }

  ngOnInit(): void {

    this.admissionService.isDeleteEducation.subscribe((res) => {
      if (res) {
        this.deleteSelectData();
      }
    });

    this.getUserConfigSetting();

    this.admissionService.isRealoadData.subscribe((res) => {
      if (res) {
        this.realodEducationList('');
      }
    });

    this.admissionService.educationDateFilter.subscribe((res: any) => {
      if (res) {
        let day = res.getDate();
        let month = res.getMonth() + 1;
        let year = res.getFullYear();
        this.filterDate = `${year}-${month}-${day}T00:00:00`;
        this.getCurrentVisitDetails('1');
        this.getCurrentVisitDetails('2');
      } else {
        this.filterDate = '';
        this.getCurrentVisitDetails('1');
        this.getCurrentVisitDetails('2');
      }
    });

    this.createAttachmentForm = this.formBuilder.group({
      attachmentType: [null, Validators.required],
      attachmentFile: [null, Validators.required],
    });

    this.admissionService.documentTypeDrop.subscribe((res: any) => {
      if (res.documentType || res.dateRange || res.selectedDocumentOU || res.selectedCreatedBy || res.previousPeriodValue) {
        this.documentTypeFilterValue = this.documentTypeFilterValueClone;
        if (res.documentType) {
          this.documentTypeFilterValue = this.documentTypeFilterValue.filter((element) => {
            if (res.documentType == element.Dtid) {
              return element;
            }
          });
        }

        if (res.dateRange) {
          this.filterFromDate = res.dateRange[0];
          this.filterToDate = res.dateRange[1];

          this.documentTypeFilterValue = this.documentTypeFilterValue.filter(item => {
            let timestamp = parseInt(item.Dodat.replace(/\/Date\((\d+)\)\//, '$1'));
            let itemDate = new Date(timestamp);
            let fromDate = new Date(this.filterFromDate);
            let toDate = new Date(this.filterToDate);

            // Set time to midnight to compare only dates
            itemDate.setHours(0, 0, 0, 0);
            fromDate.setHours(0, 0, 0, 0);
            toDate.setHours(0, 0, 0, 0);
            return itemDate >= fromDate && itemDate <= toDate;
          });
        }

        if (res.selectedDocumentOU || res.selectedCreatedBy || res.previousPeriodValue) {
          this.selectedCreatedBy = res.selectedCreatedBy;
          this.previousPeriodValue = res.previousPeriodValue;
          this.selectedDocumentOU = res.selectedDocumentOU;
          // this.documentType =  res.documentType;
          this.filterByPeriod();
        }
        // this.documentTypeFilterValue = filterValue;
        this.patientProfileDocumet = this.groupBy(this.documentTypeFilterValue, 'Dodat');
      } else {
        this.patientProfileDocumet = this.groupBy(this.documentTypeFilterValueClone, 'Dodat');
      }

      this.sortedDocuments = Object.keys(this.patientProfileDocumet).map(key => ({
        date: new Date(parseInt(key.replace('/Date(', '').replace(')/', ''))),
        documents: this.patientProfileDocumet[key]
      }));
    });
  }

  documentFilter(event) {
    console.log(event);
    if (event) {
      this.currentVisitDocumet = this.currentVisitDocumetClone.filter((element) => {
        if (event == element.DtidText) {
          return element;
        }
      });
    } else {
      this.currentVisitDocumet = this.currentVisitDocumetClone;
      this.selectedIndex = undefined;
      this.seletcedCurrentDoc = null;
    }
  }



  dateFormate(dt: any) {
    return dt.getFullYear() + '/' + (dt.getMonth() + 1) + '/' + dt.getDate();
  }

  onReleaseHistoryData(releaseId: any, item) {
    this.seletcedCurrentDoc = item;
    this.inPatientVisitData = {} as InPatientDataResult;
    this.patientVisitRecord = {} as PatientVisitDataResult;
    this.admissionService
      .getReleaseHistoryData(releaseId, this.paramsObject.einri)
      .subscribe((data) => {
        if (data && data.length) {
          this.diagnosisHistory.showPopup(data);
        }
      });
  }

  onReleaseHistoryDataCurrent(releaseId: any, item, template: TemplateRef<any>) {
    this.seletcedCurrentDoc = item;
    this.inPatientVisitData = {} as InPatientDataResult;
    this.patientVisitRecord = {} as PatientVisitDataResult;
    this.admissionService
      .getReleaseHistoryData(releaseId, this.paramsObject.einri)
      .subscribe((data) => {
        if (data && data.length) {
          this.configurationData = [];
          this.configurationData = data;
          if (data && data.length) {
            this.configurationData = data;
            this.currentDocVersionRef = this.modalService.show(template, { backdrop: true, ignoreBackdropClick: false, class: 'release-history' });
          } else {
            Swal.fire({
              text: 'No Data Found',
              confirmButtonColor: '#0890c5',
              cancelButtonColor: '#84898c',
              confirmButtonText: 'OK',
              customClass: { popup: 'myalertpopup' },
              icon: 'error',
            } as any);
          }
        }
      });
  }

  modelFormOpen(value, oldVersion) {

  }

  onOpenAttachment(attachmentId: any) {
    if (attachmentId) {
      if (attachmentId.Dtid == 'ZMED_OBPPT') {
        attachmentId['Dockey'] = attachmentId['DocKey'];
        delete attachmentId['DocKey'];
        this.admissionService.selectedCurrentDocDetails = attachmentId;
        this.admissionService.isAddEditObstetricRisk = true;
        this.admissionService.isPDFObstetricRisk = true;
        this.admissionService.isCloneObstetricRisk = true;
        this.admissionService.isCopyBtnHide = true;
        // this.selectedIconPdf.hide();
        return;
      }
      if (attachmentId.Dtid == 'ZMED_OBANT') {
        attachmentId['Dockey'] = attachmentId['DocKey'];
        delete attachmentId['DocKey'];
        this.admissionService.selectedCurrentDocDetails = attachmentId;
        this.admissionService.isAddEditObsVteAnt = true;
        this.admissionService.isPDFObsVteAnt = true;
        this.admissionService.isCloneObsVteAnt = true;
        this.admissionService.isCopyBtnHide = true;
        // this.selectedIconPdf.hide();
        return;
      }
    }

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


  formatDate(date: string) {
    if (date) {
      const newFormateDate = date.replace('/Date(', '').replace(')/', '')
      return new DatePipe('en-US').transform(newFormateDate, 'dd.MM.yyyy');
    }
  }

  onOpenAttachmentForCurrent(attachmentId: any) {
    if (this.seletcedCurrentDoc) {
      if (this.seletcedCurrentDoc.Dtid == 'ZMED_OBPPT') {
        attachmentId['Dockey'] = attachmentId['DocKey'];
        delete attachmentId['DocKey'];
        this.admissionService.selectedCurrentDocDetails = attachmentId;
        this.admissionService.isAddEditObstetricRisk = true;
        this.admissionService.isPDFObstetricRisk = true;
        this.admissionService.isCloneObstetricRisk = true;
        this.admissionService.isCopyBtnHide = true;
        // this.selectedIconPdf.hide();
        this.currentDocVersionRef.hide();
        return;
      }
      if (this.seletcedCurrentDoc.Dtid == 'ZMED_OBANT') {
        attachmentId['Dockey'] = attachmentId['DocKey'];
        delete attachmentId['DocKey'];
        this.admissionService.selectedCurrentDocDetails = attachmentId;
        this.admissionService.isAddEditObsVteAnt = true;
        this.admissionService.isPDFObsVteAnt = true;
        this.admissionService.isCloneObsVteAnt = true;
        this.admissionService.isCopyBtnHide = true;
        // this.selectedIconPdf.hide();
        this.currentDocVersionRef.hide();
        return;
      }
    }

    this.inPatientVisitData = {} as InPatientDataResult;
    this.patientVisitRecord = {} as PatientVisitDataResult;
    const config: ModalOptions = {
      class: 'modal-dialog-centered modal-xl pdfmodal-size',
    };
    this.selectedIconPdf = this.modalService.show(this.currentDocPdfVer, config);
    this.userConfigurationService
      .getAttachmentVisitData(attachmentId.DocKey)
      .subscribe((data) => {
        if (data) {
          this.patientVisitRecord = {
            ...data,
            DOCCATTOATTACHMENTS: { results: [data] },
          };

          this.InOutPatientViewValue = {
            showBoth: false,
            showIn: false,
            showOut: true,
          };
          this.sanitizeBase64();
          this.currentDocVersionRef.hide();
        }
      });
  }

  pdfFormOpen() {
    const config: ModalOptions = {
      class: 'modal-dialog-centered modal-xl pdfmodal-size',
    };
    this.selectedIconPdf = this.modalService.show(this.selectIconPdf, config);
    // this.openRealsePDFModal(this.seletcedCurrentDoc, this.labpdfmodal, '')
    this.pdfFormDiv = true;
  }

  removeDuplicates(array: any[]): any[] {
    return [...new Set(array)];
  }

  sort() {
    this.patientProfileDocumet = this.groupBy(this.documentTypeFilterValue, 'Dodat');
    this.sortedDocuments = Object.keys(this.patientProfileDocumet).map(key => ({
      date: new Date(parseInt(key.replace('/Date(', '').replace(')/', ''))),
      documents: this.patientProfileDocumet[key]
    }));
    console.log(this.sortedDocuments, "sortedDocuments");

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
    // this.documentTypeFilterValue.sort((a, b) => 0 - (a > b ? -1 : 1));
  }
  selectedDocumentOU: any;

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
    console.log(this.documentTypeFilterValue, "filterByPeriod");
  }
  parseODataDate(odataDate: string): Date {
    // Extract timestamp from the OData date format
    let timestamp = parseInt(odataDate.match(/\/Date\((\d+)\)\//)?.[1] || "0", 10);
    return new Date(timestamp);
  }

  isSameDate(date1: Date, date2: Date): boolean {
    return date1.toDateString() === date2.toDateString();
  }

  getCurrentVisitDetails(type: string) {
    this.admissionService
      .getDicumentDetails(
        this.paramsObject.einri,
        type,
        this.paramsObject.patnr,
        this.filterDate,
        this.paramsObject.falnr
      )
      .pipe(
        untilDestroyed(this),
        catchError((err) => {
          return of([]);
        })
      )
      .subscribe((data: any) => {
        if (type == '2') {
          data?.d?.results.forEach((res) => {
            if (res.Dtid === 'ZMED_NEODS') {
              res.DtidText = 'Neonatal Discharge Summary'
            }
            if (res.Dtid === 'ZMED_PHDIS') {
              res.DtidText = 'Physician Discharge Summary'
            }
            if (res.Dtid === 'ZMED_PDASM') {
              res.DtidText = 'Paediatrics Physician Admission Assessment'
            }
            if (res.Dtid === 'ZMED_OPERT') {
              res.DtidText = 'Department of Surgery - Operation Notes'
            }
          })
          this.currentVisitDocumetClone = data?.d.results;
          this.currentVisitDocumet = data?.d.results;
          this.currentVisitDocumentNameList = Array.from(
            new Set(this.currentVisitDocumet.map(res => res.DtidText))
          );
        } else {
          this.documentTypeFilterValueClone = data?.d.results;
          // this.documentTypeFilterValue = _success.d.results;
          this.filterByPeriod();
          this.sort();
          this.admissionService.departmentOUList = this.documentTypeFilterValueClone.map(item => item.MitarbName);
          this.admissionService.createdDocumentUserList = this.removeDuplicates(this.admissionService.departmentOUList);
          this.admissionService.departmentOUList = this.documentTypeFilterValueClone.map(item => item.Orgdo);
          this.admissionService.departmentOUList = this.removeDuplicates(this.admissionService.departmentOUList);
          if (this.documentTypeFilterValue.length) {
            this.documentTypeFilterValue.forEach((element) => {
              let checkPatinet = this.admissionService.documentTypeFilter.find(
                (el) => el.Dtid === element.Dtid
              );
              if (!checkPatinet) {
                this.admissionService.documentTypeFilter.push({
                  Dtid: element.Dtid,
                  DtidText: element.DtidText,
                });
              }
            });
          }
        }
      });
  }

  groupBy(array: any[], key: string): any {
    return array.reduce((result, currentValue) => {
      (result[currentValue[key]] = result[currentValue[key]] || []).push(currentValue);
      return result;
    }, {});
  }

  getDate(value) {
    if (value) {
      var str = value;
      var num = parseInt(str.replace(/[^0-9]/g, ''));
      var date = new Date(num);
      return date;
    }
  }

  getDateFilter(value) {
    if (value) {
      var str = value;
      var num = parseInt(str.replace(/[^0-9]/g, ''));
      var date = new Date(num);
      return date;
    }
  }

  convert(str) {
    var date = new Date(str),
      mnth = ('0' + (date.getMonth() + 1)).slice(-2),
      day = ('0' + date.getDate()).slice(-2);
    return [day, mnth, date.getFullYear()].join('-');
  }

  selectDocument(item, index: number) {
    // if(item.DokstText == 'Released') {
    //   this.openRealsePDFModal(item, pdfTemplate);
    // }
    if (this.selectedIndex == index) {
      this.selectedIndex = undefined;
      this.admissionService.selectedCurrentDocDetails = '';
    } else {
      this.selectedIndex = index;
      this.admissionService.selectedCurrentDocDetails = item;
    }
  }

  dockVer(value) {
    return `(v${parseInt(value)})`;
  }

  openRealsePDFModal(item, template: TemplateRef<any>, index) {
    this.isImageFrame = false;
    this.admissionService.selectedCurrentDocDetails = item;
    this.admissionService.isCopyBtnHide = false;

    // Obstetric VTE Risk Assess&Mgt Antepartum
    if (item.Dtid == 'ZMED_OBPPT') {
      this.admissionService.isAddEditObstetricRisk = true;
      this.admissionService.isPDFObstetricRisk = true;
      this.admissionService.isCloneObstetricRisk = true;
      return;
    }
    // if (item.Dtid == 'ZMED_PDASM') {
    //   this.admissionService.selectedCurrentDocDetails = item;
    //   let config: ModalOptions = {
    //     class: 'modal-dialog-centered modal-xl pdfmodal-size',
    //   };
    //   this.modalService.show(this.pmdDocumentHTML, config);
    //   // this.admissionService.isAddEditObstetricRisk = true;
    //   // this.admissionService.isPDFObstetricRisk = true;
    //   // this.admissionService.isCloneObstetricRisk = true;
    //   return;
    // }
    // Obstetric VTE Risk Assess&Mgt Postaprtum
    if (item.Dtid == 'ZMED_OBANT') {
      this.admissionService.isAddEditObsVteAnt = true;
      this.admissionService.isPDFObsVteAnt = true;
      this.admissionService.isCloneObsVteAnt = true;
      return;
    }
    this.pdfUrl = '';
    const config: ModalOptions = {
      class: 'modal-dialog-centered modal-xl pdfmodal-size',
    };

    // SOAP
    if (item.Dtid == 'ZMED_SOAP') {
      this.admissionService
        .getSoapPDF(item.Dockey)
        .pipe(
          untilDestroyed(this),
          catchError((err) => {
            return of([]);
          })
        )
        .subscribe((_success: any) => {
          this.pdfUrlConvertToBlob(_success?.d?.AttachmentData);
          this.pdfTemplateRef = this.modalService.show(template, config);
        });
    }
    else if (item.Dtid == 'ZMED_NBASM') {
      this.dayCaseDashboardService
        .getNewBornPDF(item.Dockey)
        .pipe(
          untilDestroyed(this),
          catchError((err) => {
            return of([]);
          })
        )
        .subscribe((_success: any) => {
          this.pdfUrlConvertToBlob(_success?.d?.AttachmentData);
          this.pdfTemplateRef = this.modalService.show(template, config);
        });
    }
    // Discharge Summary
    else if (item.Dtid == 'ZMED_PHDIS') {
      this.admissionService
        .getPatientVisitDataByDocKey(
          item.Dockey,
          this.paramsObject.einri,
          this.paramsObject.patnr
        )
        .pipe(
          untilDestroyed(this),
          catchError((err) => {
            return of([]);
          })
        )
        .subscribe((patientResult: InPatientDataResult) => {
          let postFileData;
          if (patientResult && patientResult.DOCCATTOATTACHMENTS) {
            if (
              patientResult.DOCCATTOATTACHMENTS?.results.length > 0 &&
              patientResult.DOCCATTOATTACHMENTS?.results.find((obj) => {
                return obj.FileId === '';
              }) != null
            )
              if (
                patientResult.DOCCATTOATTACHMENTS?.results.find((obj) => {
                  return obj.AttMimeType === 'PDF';
                }) != null
              ) {
                let getAttechment = patientResult.DOCCATTOATTACHMENTS.results.find((obj) => {
                  return obj.FileId === '';
                }).AttachmentData
                this.pdfUrlConvertToBlob(getAttechment);

              } else {
                this.isImageFrame = true;
                postFileData = this.sanitizer.bypassSecurityTrustResourceUrl(
                  `data:application/image;base64, ${patientResult.DOCCATTOATTACHMENTS.results.find((obj) => {
                    return obj.FileId === '';
                  }).AttachmentData
                  }`
                );
              }
          }
          // this.pdfUrl = postFileData;
          this.pdfTemplateRef = this.modalService.show(template, config);
        });
    }
    // Medical Report
    else if (item.Dtid == 'ZMED_MEDRP') {
      const json = {
        Dockey: item.Dockey,
      };
      this.emergencyService
        .getMedReleasedPdf(json)
        .pipe(
          untilDestroyed(this),
          catchError((err) => {
            return of([]);
          })
        )
        .subscribe((_success: any) => {
          this.pdfUrlConvertToBlob(_success?.d?.AttachmentData);
          this.pdfTemplateRef = this.modalService.show(template, config);
        });
    }
    // Education Assessment
    else if (item.Dtid == 'ZMED_EDUAS') {
      this.admissionService
        .getEducationPDF(item.Dockey)
        .pipe(
          untilDestroyed(this),
          catchError((err) => {
            return of([]);
          })
        )
        .subscribe((data: any) => {
          // let byteArray = new Uint8Array(atob(this.pdfURL?.d?.AttachmentData).split("").map(char => char.charCodeAt(0)));
          // let file = new Blob([byteArray], { type: "application/pdf" });
          // this.pdfUrl = file;
          this.pdfUrlConvertToBlob(data?.d?.AttachmentData);
          this.pdfTemplateRef = this.modalService.show(template, config);
        });
    }
    // Obstetrics & Gynecology Physician Assess
    else if (item.Dtid == 'ZMED_OBPHY') {
      const json = {
        Dockey: item.Dockey,
      };
      this.admissionService
        .getObsGynReleasedPdf(json)
        .pipe(
          untilDestroyed(this),
          catchError((err) => {
            return of([]);
          })
        )
        .subscribe((data: any) => {
          this.pdfUrlConvertToBlob(data?.d?.AttachmentData);
          this.pdfTemplateRef = this.modalService.show(template, config);
        });
    }

    // Operation report
    else if (item.Dtid == 'ZMED_ORRPT') {
      this.admissionService
        .getPatientVisitDataByDocKey(item.Dockey, this.paramsObject.einri, this.paramsObject.patnr)
        .pipe(
          untilDestroyed(this),
          catchError((err) => {
            return of([]);
          })
        )
        .subscribe((patientResult: InPatientDataResult) => {
          let postFileData;
          if (patientResult && patientResult.DOCCATTOATTACHMENTS) {
            if (
              patientResult.DOCCATTOATTACHMENTS?.results.length > 0 &&
              patientResult.DOCCATTOATTACHMENTS?.results.find((obj) => {
                return obj.FileId === '';
              }) != null
            )
              if (
                patientResult.DOCCATTOATTACHMENTS?.results.find((obj) => {
                  return obj.AttMimeType === 'PDF';
                }) != null
              ) {
                let pdfAttechemnt = patientResult.DOCCATTOATTACHMENTS.results.find((obj) => {
                  return obj.FileId === '';
                }).AttachmentData
                this.pdfUrlConvertToBlob(pdfAttechemnt);
              } else {
                this.isImageFrame = true;
                postFileData = this.sanitizer.bypassSecurityTrustResourceUrl(
                  `data:application/image;base64, ${patientResult.DOCCATTOATTACHMENTS.results.find((obj) => {
                    return obj.FileId === '';
                  }).AttachmentData
                  }`
                );
              }
          }
          // this.pdfUrl = postFileData;
          this.pdfTemplateRef = this.modalService.show(template, config);
        });
    }
    else if (item.Dtid == 'ZMED_OPERT') {
      this.admissionService
        .getPatientVisitDataByDocKey(item.Dockey, this.paramsObject.einri, this.paramsObject.patnr)
        .pipe(
          untilDestroyed(this),
          catchError((err) => {
            return of([]);
          })
        )
        .subscribe((patientResult: InPatientDataResult) => {
          let postFileData;
          if (patientResult && patientResult.DOCCATTOATTACHMENTS) {
            if (
              patientResult.DOCCATTOATTACHMENTS?.results.length > 0 &&
              patientResult.DOCCATTOATTACHMENTS?.results.find((obj) => {
                return obj.FileId === '';
              }) != null
            )
              if (
                patientResult.DOCCATTOATTACHMENTS?.results.find((obj) => {
                  return obj.AttMimeType === 'PDF';
                }) != null
              ) {
                let pdfAttechemnt = patientResult.DOCCATTOATTACHMENTS.results.find((obj) => {
                  return obj.FileId === '';
                }).AttachmentData
                this.pdfUrlConvertToBlob(pdfAttechemnt);
              } else {
                this.isImageFrame = true;
                postFileData = this.sanitizer.bypassSecurityTrustResourceUrl(
                  `data:application/image;base64, ${patientResult.DOCCATTOATTACHMENTS.results.find((obj) => {
                    return obj.FileId === '';
                  }).AttachmentData
                  }`
                );
              }
          }
          // this.pdfUrl = postFileData;
          this.pdfTemplateRef = this.modalService.show(template, config);
        });
    }
    // Neonatal Progress Note
    else if (item.Dtid == 'ZMED_NEOPN') {
      const json = {
        Dockey: item.Dockey,
      };
      this.admissionService
        .getNeoNatalReleasedPdf(json)
        .pipe(
          untilDestroyed(this),
          catchError((err) => {
            return of([]);
          })
        )
        .subscribe((data: any) => {
          this.pdfUrlConvertToBlob(data?.d?.AttachmentData);
          this.pdfTemplateRef = this.modalService.show(template, config);
        });
    }
    // Neonatal Progress Note
    else if (item.Dtid == 'ZMED_NEODS') {
      this.pdfUrl = '';
      this.dayCaseDashboardService
        .NeonatalDischargeDocPDF(item.Dockey)
        .subscribe((data: any) => {
          this.pdfUrlType = 'pdf';
          this.pdfUrlConvertToBlob(data?.d?.AttachmentData);
          // this.pdfUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
          //   'data:application/pdf;base64,' + data.d.AttachmentData
          // );
          const config: ModalOptions = {
            class: 'modal-dialog-centered modal-xl pdfmodal-size',
          };
          this.pdfTemplateRef = this.modalService.show(template, config);
        });

      // this.admissionService
      //   .getNeoNatalReleasedPdf(json)
      //   .pipe(
      //     untilDestroyed(this),
      //     catchError((err) => {
      //       return of([]);
      //     })
      //   )
      //   .subscribe((data: any) => {
      //     this.pdfUrlConvertToBlob(data?.d?.AttachmentData);
      //     this.pdfTemplateRef = this.modalService.show(template, config);
      //   });
    }

    // Neonatal Medical Report
    else if (item.Dtid == 'ZMED_NEOMD') {
      const json = {
        Dockey: item.Dockey,
      };
      this.admissionService
        .getNeoNatalMRReleasedPdf(json)
        .pipe(
          untilDestroyed(this),
          catchError((err) => {
            return of([]);
          })
        )
        .subscribe((data: any) => {
          this.pdfUrlConvertToBlob(data?.d?.AttachmentData);
          this.pdfTemplateRef = this.modalService.show(template, config);
        });
    }
    else if (item.Dtid == 'ZMED_PHASM') {
      const json = {
        Dockey: item.Dockey,
      };
      this.admissionService
        .getPhysicianAssessDocPDF(json)
        .pipe(
          untilDestroyed(this),
          catchError((err) => {
            return of([]);
          })
        )
        .subscribe((data: any) => {
          this.pdfUrlConvertToBlob(data?.d?.AttachmentData);
          this.pdfTemplateRef = this.modalService.show(template, config);
        });
    }
    else if (item.Dtid == 'ZMED_TRFAS') {
      const json = {
        Dockey: item.Dockey,
      };
      this.admissionService
        .getTransferAssSetDocPDF(json)
        .pipe(
          untilDestroyed(this),
          catchError((err) => {
            return of([]);
          })
        )
        .subscribe((data: any) => {
          this.pdfUrlConvertToBlob(data?.d?.AttachmentData);
          this.pdfTemplateRef = this.modalService.show(template, config);
        });
    }
    else if (item.Dtid == 'ZMED_NICAD') {
      const json = {
        Dockey: item.Dockey,
      };
      this.admissionService
        .getNicuAddNoteDocPDF(json)
        .pipe(
          untilDestroyed(this),
          catchError((err) => {
            return of([]);
          })
        )
        .subscribe((data: any) => {
          this.pdfUrlConvertToBlob(data?.d?.AttachmentData);
          this.pdfTemplateRef = this.modalService.show(template, config);
        });
    }
    else if (item.Dtid == 'ZMED_VISIT') {
      this.admissionService
        .getPatientProfilePDF(item.Dockey)
        .subscribe((_success: any) => {
          this.pdfUrlConvertToBlob(_success?.d?.AttachmentData);
          this.pdfTemplateRef = this.modalService.show(template, config);
        })
    }
    else if(item.Dtid == 'ZMED_PDASM') {
      this.admissionService
      .getPatientProfilePDF(item.Dockey)
      .subscribe((_success: any) => {
        this.pdfUrlConvertToBlob(_success?.d?.AttachmentData);
          this.pdfTemplateRef = this.modalService.show(template, config);
      })
    }

  }


  pdfUrlConvertToBlob(pdfValue) {
    let byteArray = new Uint8Array(atob(pdfValue).split("").map(char => char.charCodeAt(0)));
    let file = new Blob([byteArray], { type: "application/pdf" });
    this.pdfUrl = file;
  }

  realodEducationList(event) {
    console.log(event, "pppppppppppppppppppppppppp")
    this.selectedIndex = undefined;
    this.getCurrentVisitDetails('1');
    this.getCurrentVisitDetails('2');
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
        this.userconfig = userconfig;
        this.admissionService.dichargeUserConfig = userconfig;
        // this.periodParameterMonthSelectValue =
        //   this.userconfig.PeriodParameterMonth;
      });
  }

  deleteSelectData() {
    this.admissionService
      .deleteEducationDetails(
        this.admissionService.selectedCurrentDocDetails.Dockey
      )
      .pipe(
        untilDestroyed(this),
        catchError((err) => {
          return of([]);
        })
      )
      .subscribe((data: any) => {
        this.admissionService.isDeleteEducation.next(false);
        this.realodEducationList('');
      });
  }

  closePdfModal() {
    this.pdfTemplateRef.hide();
  }
  getReleasedPdf(item, template: TemplateRef<any>) {
    this.releaseDocumentImage = ''
    this.admissionService
      .getPatientProfilePDF(item.Dockey)
      .subscribe((_success: any) => {
        if (item.AttMimeType == 'PDF') {
          this.pdfUrlConvertToBlob(_success.d.AttachmentData);
          const config: ModalOptions = {
            class: 'modal-dialog-centered modal-xl pdfmodal-size',
          };
          this.pdfTemplateRef = this.modalService.show(template, config);
          this.pdfUrlType = 'pdf';
        } else if (item.AttMimeType == 'url') {
          window.open(_success.d.Url);
        } else if (item.AttMimeType == 'image/bmp') {
          const config: ModalOptions = {
            class: 'modal-dialog-centered modal-xl pdfmodal-size',
          };
          this.pdfTemplateRef = this.modalService.show(template, config);
          this.releaseDocumentImage = 'data:image/png;base64,' + _success.d.AttachmentData;
          this.pdfUrlType = 'image';
        } else if (item.AttMimeType == 'HTML') {
          const config: ModalOptions = {
            class: 'modal-dialog-centered modal-xl pdfmodal-size',
          };
          this.pdfTemplateRef = this.modalService.show(template, config);
          this.htmlData = this.sanitizer.bypassSecurityTrustHtml(_success.d.AttachmentDataStr);
          this.pdfUrlType = 'html';
        }
      });
  }

  saveNeonatalDischarge() {
    let docStatus = '1';
    // if(this.selectedDocData?.Dockey) docStatus = '3';
    this.NeonatalDischDocumentComp.createNeonatalDischargeDocument(docStatus).then((formValue: any) => {
      if (formValue) {

      }
    }).catch((error: any) => {
      console.error('Error scale:', error);
      console.error('Error creating Neonatal Discharge Summary:', error);
    });
  }

  releaseNeonatalDischarge() {
    let docStatus = '2';
    // if(this.selectedDocData?.Dockey) docStatus = '3';
    this.NeonatalDischDocumentComp.createNeonatalDischargeDocument(docStatus).then((formValue: any) => {
      if (formValue) {

      }
    }).catch((error: any) => {
      console.error('Error scale:', error);
      console.error('Error creating Neonatal Discharge Summary:', error);
    });
  }

  showDocumentList() {
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
      !this.admissionService.isAddEditNeonatal &&
      !this.admissionService.isAddEditNeonatalMR &&
      !this.admissionService.isAddEditDocVisitForm &&
      !this.admissionService.isAddEditTransferAssestForm &&
      !this.admissionService.isAddEditNewbornAssessment &&
      !this.admissionService.isAddNicuForm &&
      !this.admissionService.isNewBornForm &&
      !this.admissionService.isAddEditDocPaediatricsAdmissionForm &&
      !this.admissionService.isAddEditNeonatalDischarge &&
      !this.admissionService.isAddEditSurgeryOprationNoteForm
    ) {
      return true;
    }
    return false;
  }

  getTitleName(item: any) {
    return `${item.Dktxt} (v${item.Dtvers === '001' ? '1' : '0'})`;
  }

  sanitizeBase64() {
    this.isImageFrame = false;
    if (
      this.inPatientVisitData &&
      this.inPatientVisitData.DOCCATTOATTACHMENTS
    ) {
      // this.inOutData = {};
      // this.inOutData = this.inPatientVisitData;
      // this.inOutData['DataType'] = "in-patient";
      if (
        this.inPatientVisitData.DOCCATTOATTACHMENTS?.results.length > 0 &&
        this.inPatientVisitData.DOCCATTOATTACHMENTS?.results.find((obj) => {
          return obj.FileId === '';
        }) != null
      )
        if (
          this.inPatientVisitData.DOCCATTOATTACHMENTS?.results.find((obj) => {
            return obj.AttMimeType === 'PDF';
          }) != null
        ) {
          this.isImageFrame = true;
          let pdfAttechemnt = this.inPatientVisitData.DOCCATTOATTACHMENTS.results.find(
            (obj) => {
              return obj.FileId === '';
            }
          ).AttachmentData
          return this.pdfUrlConvertToBlob(pdfAttechemnt);
        } else {
          this.isImageFrame = true;
          this.pdfUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
            `data:application/image;base64, ${this.inPatientVisitData.DOCCATTOATTACHMENTS.results.find(
              (obj) => {
                return obj.FileId === '';
              }
            ).AttachmentData
            }`
          );
        }
    }
    if (this.patientVisitRecord && this.patientVisitRecord.VISITTOATTACHMENTS) {
      // this.inOutData = {};
      // this.inOutData = this.patientVisitRecord
      if (
        this.patientVisitRecord.VISITTOATTACHMENTS?.results.length > 0 &&
        this.patientVisitRecord.VISITTOATTACHMENTS?.results.find((obj) => {
          return obj.FileID === '';
        }) != null
      )
        if (
          this.patientVisitRecord.VISITTOATTACHMENTS?.results.find((obj) => {
            return obj.AttMimeType === 'PDF';
          }) != null
        ) {
          let pdfAttechemnt = this.patientVisitRecord.VISITTOATTACHMENTS.results.find((obj) => {
            return obj.FileID === '';
          }).AttachmentData
          return this.pdfUrlConvertToBlob(pdfAttechemnt);
        } else {
          this.isImageFrame = true;
          this.pdfUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
            `data:application/image;base64, ${this.patientVisitRecord.VISITTOATTACHMENTS.results.find((obj) => {
              return obj.FileID === '';
            }).AttachmentData
            }`
          );
        }
    } else if (
      this.patientVisitRecord &&
      this.patientVisitRecord.DOCCATTOATTACHMENTS
    ) {
      // this.inOutData = {};
      // this.inOutData = this.patientVisitRecord
      if (
        this.patientVisitRecord.DOCCATTOATTACHMENTS?.results.length > 0 &&
        this.patientVisitRecord.DOCCATTOATTACHMENTS?.results.find((obj) => {
          return obj.FileID === '';
        }) != null
      )
        if (
          this.patientVisitRecord.DOCCATTOATTACHMENTS?.results.find((obj) => {
            return obj.AttMimeType === 'PDF';
          }) != null
        ) {
          let pdfAttechemnt = this.patientVisitRecord.DOCCATTOATTACHMENTS.results.find(
            (obj) => {
              return obj.FileID === '';
            }
          ).AttachmentData
          this.pdfUrlConvertToBlob(pdfAttechemnt);
        } else {
          this.isImageFrame = true;
          this.pdfUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
            `data:application/image;base64, ${this.patientVisitRecord.DOCCATTOATTACHMENTS.results.find(
              (obj) => {
                return obj.FileID === '';
              }
            ).AttachmentData
            }`
          );
        }
    }
    // if(this.isInPatientSoap){
    //   this.inOutData = this.inPatientSoapData;
    //   this.inOutData['DataType'] = 'in-patient'
    //   return this.sanitizer.bypassSecurityTrustResourceUrl(
    //     `data:application/pdf;base64, ${this.soapPdf?.AttachmentData}`
    //   );
    // }
  }

  openModalForAttachment() {
    this.removeFile();
    const config: ModalOptions = { class: 'modal-dialog-centered attachment-modal' };
    this.getAttachmentsList();
    this.createAttachmentForm.reset();
    this.modalRef = this.modalService.show(this.attachmentModal, config);
    this.modalRef.hide();
    this.userProfile = this.storageService.getUserProfile();
    this.modalRef.onHide.subscribe((reason: string | any) => {
      if (reason === 'backdrop-click') {
      }
    });
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
            this.userConfigurationService.getListOfPatientVisitDataSet()
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
  closePopup() { if (this.modalService) { this.modalService.hide(); } }

}
