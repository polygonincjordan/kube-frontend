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
@UntilDestroy()
@Component({
  selector: 'app-documentation-list',
  templateUrl: './documentation-list.component.html',
  styleUrls: ['./documentation-list.component.scss'],
})
export class DocumentationListComponent implements OnInit {
  @ViewChild('diagnosisHistory', { static: true })
  diagnosisHistory: DiagnosisHistoryPopupComponent;
  @ViewChild('selectIconPdf', { static: true }) selectIconPdf: TemplateRef<any>;
  @ViewChild('currentDocPdfVer', { static: true }) currentDocPdfVer: TemplateRef<any>;
  @ViewChild('attachmentmodal') attachmentModal: any;
  modalRef: BsModalRef;
  @Input() searchString: string;
  @Input() soapFormEvent: string = '';
  @Input() filterDateValue: string;
  @Input() isDocumentTypeFilter: boolean;
  @Input() isExpanded;
  currentVisitDocumet: any = [];
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

  createAttachmentForm:FormGroup;
  attachmentList: any;
  modalRefForStrucDoc:BsModalRef;
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

  constructor(
    private patientHistoryService:PatientHistoryService,
    private storageService:StorageService,
    public admissionService: AdmissionService,
    private route: ActivatedRoute,
    public modalService: BsModalService,
    private sanitizer: DomSanitizer,
    private userConfigurationService: UserConfigurationService,
    private inPatientConfigurationService: InPatientConfigurationService,
    private emergencyService: EmergencyService,
    private formBuilder: FormBuilder
  ) {
    this.route.queryParams.subscribe((params) => {
      this.paramsObject = params;
    });
    admissionService.isClearSelectedDoc.subscribe((res)=>{
      if(res) {
        this.selectedIndex = undefined;
        this.admissionService.isClearSelectedDoc.next(false);
      }
    })
   admissionService.document.subscribe((res)=>{
      if(res) {
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

    this.createAttachmentForm= this.formBuilder.group({
      attachmentType: [null, Validators.required],
    attachmentFile: [null, Validators.required],
    });

    this.admissionService.documentTypeDrop.subscribe((res: any) => {
      if (res.documentType || res.dateRange) {
        let filterValue = this.documentTypeFilterValue;
        if (res.documentType) {
          filterValue = filterValue.filter((element) => {
            if (res.documentType == element.Dtid) {
              return element;
            }
          });
        }

        if (res.dateRange) {
          this.filterFromDate = res.dateRange[0];
          this.filterToDate = res.dateRange[1];
          filterValue=filterValue.filter(item =>{
            let itemDate = new Date(this.dateFormate(this.getDate(item.Dodat)));
            let fromDate = new Date(this.filterFromDate);
            let toDate = new Date(this.filterToDate);
            return itemDate >= fromDate && itemDate <= toDate;
          })
        }
        this.patientProfileDocumet = this.groupBy(filterValue, 'Dodat');
      } else {
        this.patientProfileDocumet = this.groupBy(this.documentTypeFilterValue, 'Dodat');
      }
    });
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
              customClass: 'myalertpopup',
              icon: 'error',
            });
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

          if(attachmentId.Mimetype == 'PDF') {
              this.pdfUrlConvertToBlob(_success.d.AttachmentData);
              console.log(this.pdfUrl, "--");
              this.pdfUrlType = 'pdf';
              this.pdfFormOpen();
          } else if(attachmentId.Mimetype == 'url') {
            window.open(_success.d.Url);
          } else if(attachmentId.Mimetype == 'image/bmp'){
            this.pdfUrlType = 'image';
            this.pdfFormOpen();
            this.releaseDocumentImage = 'data:image/png;base64,' + _success.d.AttachmentData;
          } else if(attachmentId.Mimetype == 'HTML') {
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
      return new DatePipe('en-US').transform(newFormateDate, 'dd.MM.YYYY');
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
          this.currentVisitDocumet = data?.d.results;
        } else {
          // this.patientProfileDocumet = data?.d.results;
          this.documentTypeFilterValue = data?.d.results;
          this.patientProfileDocumet = this.groupBy(data?.d?.results, 'Dodat');
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
                  `data:application/image;base64, ${
                    patientResult.DOCCATTOATTACHMENTS.results.find((obj) => {
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
    else if(item.Dtid == 'ZMED_ORRPT') {
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
              let pdfAttechemnt =  patientResult.DOCCATTOATTACHMENTS.results.find((obj) => {
                return obj.FileId === '';
              }).AttachmentData
              this.pdfUrlConvertToBlob(pdfAttechemnt);
            } else {
              this.isImageFrame = true;
              postFileData = this.sanitizer.bypassSecurityTrustResourceUrl(
                `data:application/image;base64, ${
                  patientResult.DOCCATTOATTACHMENTS.results.find((obj) => {
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
    }else if (item.Dtid == 'ZMED_PHASM') {
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
    } else if(item.Dtid == 'ZMED_VISIT') {
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
          if(item.AttMimeType == 'PDF') {
            this.pdfUrlConvertToBlob(_success.d.AttachmentData);
            const config: ModalOptions = {
              class: 'modal-dialog-centered modal-xl pdfmodal-size',
            };
            this.pdfTemplateRef = this.modalService.show(template, config);
            this.pdfUrlType = 'pdf';
          } else if(item.AttMimeType == 'url') {
            window.open(_success.d.Url);
          } else if(item.AttMimeType == 'image/bmp') {
            const config: ModalOptions = {
              class: 'modal-dialog-centered modal-xl pdfmodal-size',
            };
            this.pdfTemplateRef = this.modalService.show(template, config);
            this.releaseDocumentImage = 'data:image/png;base64,' + _success.d.AttachmentData;
            this.pdfUrlType = 'image';
          } else if(item.AttMimeType == 'HTML') {
            const config: ModalOptions = {
              class: 'modal-dialog-centered modal-xl pdfmodal-size',
            };
            this.pdfTemplateRef = this.modalService.show(template, config);
            this.htmlData = this.sanitizer.bypassSecurityTrustHtml(_success.d.AttachmentDataStr);
            this.pdfUrlType = 'html';
          }
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
      !this.admissionService.isAddEditDocVisitForm&&
      !this.admissionService.isAddEditTransferAssestForm
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
            `data:application/image;base64, ${
              this.inPatientVisitData.DOCCATTOATTACHMENTS.results.find(
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
            `data:application/image;base64, ${
              this.patientVisitRecord.VISITTOATTACHMENTS.results.find((obj) => {
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
            `data:application/image;base64, ${
              this.patientVisitRecord.DOCCATTOATTACHMENTS.results.find(
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
      this.modalRef = this.modalService.show(this.attachmentModal,config);
        this.modalRef.hide();
        this.userProfile = this.storageService.getUserProfile();
        this.modalRef.onHide.subscribe((reason: string | any) => {
          if(reason === 'backdrop-click') {
          }
        });
   }

  getAttachmentsList() {
    this.patientHistoryService.getAttachmentsList().subscribe(
      (_success: any) => {
       this.attachmentList = _success.d.results;

      },
      (_error: any) => {}
    );
  }

  resetAttachment(){
    this.modalRef.hide();
    this.createAttachmentForm.reset();
  }

  handleFileChange(event){
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

  createAttachmentDoc(){
    this.createAttachmentForm.markAllAsTouched();
    if(this.createAttachmentForm.valid){
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
        "AttachmentDataStr":this.base64Value
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
            this.inPatientConfigurationService.getListOfAllPatientVisitDataSet();
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
      customClass: 'myalertpopup',
      icon: 'error'
    });
  }
}
