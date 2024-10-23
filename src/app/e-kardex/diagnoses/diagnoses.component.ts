import { DatePipe } from '@angular/common';
import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { ModalDismissReasons, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { InPatientDataResult } from '@services/e-kardex/interfaces/inpatient-data';
import { cloneDeep as _cloneDeep } from 'lodash';
import { Observable, ReplaySubject, Subscription, catchError, of } from 'rxjs';
import { InPatientConfigurationService } from '../../services/e-kardex/inPatient.service';
import {
  DocType,
  PatientCaseSetDataType, PatientVisitDataResult
} from '../../services/e-kardex/interfaces/patient-visit-data';
import {
  PeriodParameterType, UserConfig
} from '../../services/e-kardex/interfaces/user-config';
import { UserConfigurationService } from '../../services/e-kardex/user-configuration.service';
import { StorageService } from '../../services/storage.service';
import { DiagnosisHistoryPopupComponent } from './dignosis-history-popup/diagnosis-history-popup.component';
import { Dummy } from './dummyData';
import { ActivatedRoute } from '@angular/router';
import Swal from 'sweetalert2';
import { error } from 'console';
import { AdmissionService } from '@services/admission/admission.service';
import { BsModalRef, BsModalService, ModalOptions } from 'ngx-bootstrap/modal';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { FormBuilder, FormGroup } from '@angular/forms';
import { PatientHistoryService } from '@services/e-kardex/patient-history.service';
import { KeyValue } from '@angular/common';

@UntilDestroy()
@Component({
  selector: 'app-diagnoses',
  templateUrl: './diagnoses.component.html',
  styleUrls: ['./diagnoses.component.scss'],
})
export class DiagnosesComponent implements OnInit {
  modalRef: BsModalRef;
  userProfile: any;
  attachmentList: any;
  isLoading = false;
  isError = false;
  isAscending = false;
  isOutPatient = true;
  InOutPatientViewValue: any = {
    showBoth: true,
    showIn: false,
    showOut: false,
  };
  userconfig: UserConfig = {} as UserConfig;
  saveUserconfig: UserConfig = {} as UserConfig;
  patientVisitdataSource: PatientVisitDataResult[] = [];
  inPatientVisitDataSource: PatientVisitDataResult[] = [];
  inPatientVisitDataSourceWithoutDocument: PatientVisitDataResult[] = [];
  patientVisitRecord: PatientVisitDataResult = {} as PatientVisitDataResult;
  patientAllVisitdataSource: PatientVisitDataResult[] = [];
  patientCaseSetDataSource: PatientCaseSetDataType[] = [];
  patientCaseSetOriginalDataSource: PatientCaseSetDataType[] = [];
  patientGridVisitdataSource: PatientVisitDataResult[] = [];
  patientAllRefreshdataSource: PatientVisitDataResult[] = [];
  columnsToDisplay = ['attending_doctor', 'date', 'diagnosis', 'notes'];
  searchTextValue: string = '';
  seeMoreListNumber: number = 10;
  closeResult = '';
  nodatafound: boolean = false;
  noDatafoundInPatient: boolean = false;
  nopopUpdatafound: boolean = false;
  isPopUpError = false;
  periodParameterCheckValue: PeriodParameterType = {
    month: false,
    date: false,
  };
  periodParameterMonthSelectValue: string = '1';
  showAllValue: boolean = false;

  bsValue = new Date();
  bsRangeValue: Date[];
  maxDate = new Date();
  showAllChecked: boolean = false;

  bsInlineValue = new Date();
  inPatientShow = false;
  createAttachmentForm:FormGroup;
  inPatientForm: string;
  inPatientSoapForm = false;
  inPatientSoapData: any;
  inPatientVisitData: InPatientDataResult;
  inPatientDischargeData: any;
  oldversion: boolean;
  subscription: Subscription;
  soapFormDiv: boolean = false;
  pdfFormDiv: boolean = false;
  visitFormDiv: boolean = false;
  isCreateRequest: boolean = false;
  isCopyRequest: boolean = false;
  @ViewChild('diagnosisHistory', { static: true }) diagnosisHistory: DiagnosisHistoryPopupComponent;
  editing: boolean = false;
  isCopy:boolean=false;
  inPatientSoapVisitData: any;
  isInPatientSoap: boolean=false;
  soapPdf: any;
  active: boolean = false;

  
  patientProfileDocumet:  { [key: string]: any[] } = {};
  currentVisitDocumet: any = [];
  paramsObject:any
  documentTypeFilterValue: any[] = [];
  filterDate: any = '';
  releaseDocumentImage: any;
  pdfUrl: Blob;
  pdfTemplateRef: any;
  pdfUrlType: string;
  htmlData: any;
  firstFiveDocuments: [string, any[]][];
  newLimitProfileList: { [key: string]: any[] } = {};modalReference: any;
;
  
  constructor(
    private sanitizer: DomSanitizer,
    private modalServiceForAllergy: BsModalService,
    public bsModalService: BsModalService,
    private modalService: NgbModal,
    private userConfigurationService: UserConfigurationService,
    private inPatientConfigurationService: InPatientConfigurationService,
    private storageService: StorageService,
    private route: ActivatedRoute,
    private admissionService:AdmissionService,
    private formBuilder: FormBuilder,
    private patientHistoryService:PatientHistoryService
  ) {

    this.createAttachmentForm= this.formBuilder.group({
      attachmentType: [''],
      attachmentFile: [''],
    });

    this.route.queryParams.subscribe((params) => {
      this.paramsObject = params;
    });
  }

  ngOnInit(): void {
    this.isLoading = true;
    this.subscription = this.route.queryParams.subscribe(() => {
      this.userConfigurationService.getListOfPatientVisitDataSet();
      this.inPatientConfigurationService.getListOfAllPatientVisitDataSet();
      this.inPatientConfigurationService.getPatientCaseSet();
      this.getDataByUserConfig();
      this.getDataByInPatientConfig();
      this.getUserConfigSetting();
      this.getPatientCaseStepperData();
      this.getAttachmentsList();
      
    })

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

        // if (res.dateRange) {
        //   this.filterFromDate = res.dateRange[0];
        //   this.filterToDate = res.dateRange[1];
        //   filterValue=filterValue.filter(item =>{
        //     let itemDate = new Date(this.dateFormate(this.getDate(item.Dodat)));
        //     let fromDate = new Date(this.filterFromDate);
        //     let toDate = new Date(this.filterToDate);
        //     return itemDate >= fromDate && itemDate <= toDate;
        //   })
        // }
        // this.patientProfileDocumet = this.groupBy(filterValue, 'Dodat');
      } else {
        this.patientProfileDocumet = this.groupBy(this.documentTypeFilterValue, 'Dodat');
        this.limitItems();
        console.log('1111', this.patientProfileDocumet);
        
      }
    });


  }
  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
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

  dockVer(value) {
    return `(v${parseInt(value)})`;
  }
  pdfUrlConvertToBlob(pdfValue) {
    let byteArray = new Uint8Array(atob(pdfValue).split("").map(char => char.charCodeAt(0)));
    let file = new Blob([byteArray], { type: "application/pdf" });
    this.pdfUrl = file;
  }

  getnewReleasedPdf(item, template: TemplateRef<any>) {
    this.releaseDocumentImage = ''
      this.admissionService
        .getPatientProfilePDF(item.Dockey)
        .subscribe((_success: any) => {
          if(item.AttMimeType == 'PDF') {
            this.pdfUrlConvertToBlob(_success.d.AttachmentData);
            const config: ModalOptions = {
              class: 'modal-dialog-centered modal-xl pdfmodal-size',
            };
            this.pdfTemplateRef = this.bsModalService.show(template, config);
            this.pdfUrlType = 'pdf';
          } else if(item.AttMimeType == 'url') {
            window.open(_success.d.Url);
          } else if(item.AttMimeType == 'image/bmp') {
            const config: ModalOptions = {
              class: 'modal-dialog-centered modal-xl pdfmodal-size',
            };
            this.pdfTemplateRef = this.bsModalService.show(template, config);
            this.releaseDocumentImage = 'data:image/png;base64,' + _success.d.AttachmentData;
            this.pdfUrlType = 'image';
          } else if(item.AttMimeType == 'HTML') {
            const config: ModalOptions = {
              class: 'modal-dialog-centered modal-xl pdfmodal-size',
            };
            this.pdfTemplateRef = this.bsModalService.show(template, config);
            this.htmlData = this.sanitizer.bypassSecurityTrustHtml(_success.d.AttachmentDataStr);
            this.pdfUrlType = 'html';
          }
        });
  }

  closePdfModal() {
    this.pdfTemplateRef.hide();
  }
  onReleaseNewHistoryData(releaseId: any, item) {
    // this.seletcedCurrentDoc = item;
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

  getDataByUserConfig() {
  this.userConfigurationService.patientData$
      .pipe(
        untilDestroyed(this),
        catchError((err) => {
          this.isLoading = false;
          this.isError = true;
          return of([]);
        })
      )
      .subscribe((patientVisitData: PatientVisitDataResult[]) => {
        this.isLoading = false;
        if (patientVisitData.length == 0) {
          this.nodatafound = true;
        } else {
          let deep = _cloneDeep(patientVisitData);
          deep.sort((a, b) => {
            return b.Erdattim - a.Erdattim;
          });
          this.isAscending = false;
          this.nodatafound = false;
          this.isError = false;
          this.patientVisitdataSource = deep;
        }
      });
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
          let deep = _cloneDeep( data?.d.results);
          deep.sort((a, b) => {
            return b.Dodat - a.Dodat;
          });
          this.patientProfileDocumet = this.groupBy(deep, 'Dodat');
          this.limitItems()
          console.log('222',this.patientProfileDocumet);
          this.documentTypeFilterValue.forEach((element) => {
            let checkPatinet = this.admissionService.documentTypeFilter.find(
              (el) => el?.Dtid === element?.Dtid
            );
            if (!checkPatinet) {
              this.admissionService.documentTypeFilter.push({
                Dtid: element?.Dtid,
                DtidText: element.DtidText,
              });
            }
          });
        }
      });
  }

  limitItems() {
    let limit = 0;
    let proObj = {};
    Object.keys(this.patientProfileDocumet).forEach((item) => {
     
     this.patientProfileDocumet[item].forEach((data: any) => {
        if (limit < 5) {
          if (!proObj[item.replace('/Date(', '').replace(')/', '')]) {
            proObj[item.replace('/Date(', '').replace(')/', '')] = [];
          }
          proObj[item.replace('/Date(', '').replace(')/', '')].push(data);
          limit++;
        }
      });
    });
    this.newLimitProfileList = proObj
  }

  groupBy(array: any[], key: string): any {
    return array.reduce((result, currentValue) => {
      (result[currentValue[key]] = result[currentValue[key]] || []).push(currentValue);
      return result;
    }, {});
  }

  getDataByInPatientConfig() {
    this.inPatientConfigurationService.inPatientAllData$
      .pipe(
        untilDestroyed(this),
        catchError((err) => {
          this.isLoading = false;
          this.isError = true;
          return of([]);
        })
      )
      .subscribe((patientVisitData: PatientVisitDataResult[]) => {
        this.isLoading = false;
        if (patientVisitData.length == 0) {
          this.noDatafoundInPatient = true;
        } else {
          let deep = _cloneDeep(patientVisitData);
          deep.sort((a, b) => {
            return b.Erdattim - a.Erdattim;
          });
          this.isAscending = false;
          this.noDatafoundInPatient = false;
          this.isError = false;
          this.inPatientVisitDataSource = deep;
          this.inPatientVisitDataSourceWithoutDocument = deep.filter(x => x.Dtid != 'ZMED_ATCHM');
        }
      });
  }

  getAllPatientData() {
    this.userConfigurationService.patientAllData$
      .pipe(
        untilDestroyed(this),
        catchError((err) => {
          this.isPopUpError = true;
          return of([]);
        })
      )
      .subscribe((patientVisitData: PatientVisitDataResult[]) => {
        this.isLoading = false;
        if (patientVisitData.length == 0) {
          this.nopopUpdatafound = true;
        } else {
          let deep = _cloneDeep(patientVisitData);
          deep.sort((a, b) => {
            return b.Erdattim - a.Erdattim;
          });
          this.isAscending = false;
          this.populatePatientPopuPData(deep);
        }
      });
  }

  getPatientCaseStepperData() {
    let orgData = _cloneDeep(Dummy);
    const filtered = orgData.filter(
      (x) => x.MovementType === 'MI' || x.MovementType === 'OS'
    );
    const unique: any = [...new Map(filtered.map((m) => [m.Case, m])).values()];
    for (let i = 0; i < unique.length; i++) {
      let count = 0;
      let indPos = [];

      for (let j = 0; j < orgData.length; j++) {
        if (
          unique[i].Case === orgData[j].Case &&
          (orgData[j].MovementType === 'MI' || orgData[j].MovementType === 'OS')
        ) {
          count += 1;
          indPos.push(j);
        }
      }
      if (count > 1) {
        const pos = indPos[0] + 1;
        const removeCount = count - 1;
        orgData.splice(pos, removeCount);
      }
    }

    this.inPatientConfigurationService.patientCaseSetData$
      .pipe(
        untilDestroyed(this),
        catchError((err) => {
          this.isLoading = false;
          this.isError = true;
          return of([]);
        })
      )
      .subscribe((patientCaseStepperData: PatientCaseSetDataType[]) => {
        this.isLoading = false;
        let sortedData = patientCaseStepperData.sort((a: any, b: any) => {
          return b.Case - a.Case;
        });
        this.patientCaseSetOriginalDataSource = sortedData;

        let orgData = _cloneDeep(sortedData);
        const filtered = orgData.filter(
          (x) => x.MovementType === 'MI' || x.MovementType === 'OS'
        );
        const unique: any = [...new Map(filtered.map((m) => [m.Case, m])).values()];
        for (let i = 0; i < unique.length; i++) {
          let count = 0;
          let indPos = [];

          for (let j = 0; j < orgData.length; j++) {
            if (
              unique[i].Case === orgData[j].Case &&
              (orgData[j].MovementType === 'MI' || orgData[j].MovementType === 'OS')
            ) {
              count += 1;
              indPos.push(j);
            }
          }
          if (count > 1) {
            const pos = indPos[0] + 1;
            const removeCount = count - 1;
            orgData.splice(pos, removeCount);
          }
        }

        this.patientCaseSetDataSource = orgData;
      });
  }

  private populatePatientPopuPData(patientVisitData: PatientVisitDataResult[]) {
    this.popupGridData(patientVisitData);
    this.patientAllRefreshdataSource = _cloneDeep(patientVisitData);
  }

  private popupGridData(patientVisitData: PatientVisitDataResult[]) {
    this.nopopUpdatafound = false;
    this.isPopUpError = false;
    if (patientVisitData.length < 1) {
      this.nopopUpdatafound = true;
    }
    this.patientAllVisitdataSource = _cloneDeep(patientVisitData);
    this.seeMoreListNumber = 10;
    this.patientGridVisitdataSource = _cloneDeep(
      this.patientAllVisitdataSource.slice(0, this.seeMoreListNumber)
    );
  }

  openEnlarge(content, dataType: string) {
    this.closeAllForm();
    this.bsRangeValue = [] as Date[];
    if (dataType === 'OutPatient') {
      this.populatePatientPopuPData(this.patientVisitdataSource);
    } else {
      this.populatePatientPopuPData(this.inPatientVisitDataSource);
    }
    this.modalService
      .open(content, { ariaLabelledBy: 'modal-basic-title' })
      .result.then(
        (result) => {
          this.closeResult = `Closed with: ${result}`;
        },
        (reason) => {
          this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
        }
      );
  }

  checkSortButton() {
    let deep = _cloneDeep(this.patientAllVisitdataSource);
    switch (this.isAscending) {
      case true:
        deep.sort((a, b) => {
          return b.Erdattim - a.Erdattim;
        });
        this.isAscending = false;
        break;
      case false:
        deep.sort((a, b) => {
          return a.Erdattim - b.Erdattim;
        });
        this.isAscending = true;
        break;
      default:
        break;
    }
    this.popupGridData(deep);
  }

  checkShowAll(event: any, dataType: string) {
    this.showAllChecked = event.target.checked;
    this.callAllPatientData(dataType);
  }

  private callAllPatientData(dataType?: string) {
    let fromdate = '';
    let todate = '';
    let showall = '';
    if (this.bsRangeValue && this.bsRangeValue.length > 1) {
      fromdate = `${new DatePipe('en-US').transform(
        this.bsRangeValue[0],
        'yyyy-MM-dd'
      )}T00:00:00`;
      todate = `${new DatePipe('en-US').transform(
        this.bsRangeValue[1],
        'yyyy-MM-dd'
      )}T00:00:00`;
    }

    if (this.showAllChecked) showall = 'X';
    if (dataType === "OutPatient") {
      this.userConfigurationService.getListOfAllPatientVisitDataSet(
        showall,
        fromdate,
        todate
      );
    } else {
      this.inPatientConfigurationService.getListOfAllPatientVisitDataSet(
        showall,
        fromdate,
        todate
      )
    }
    this.getAllPatientData();
  }

  onDateRangeChange(event: any, dataType: string) {
    this.callAllPatientData(dataType);
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
        this.periodParameterMonthSelectValue =
          this.userconfig.PeriodParameterMonth;
      });
  }

  sattingmodel:any;
  openSettings(content) {
    this.closeAllForm();
    this.sattingmodel= content;
    this.saveUserconfig = Object.assign({}, this.userconfig);
    // Store the modal reference when opening the modal
  this.modalReference = this.modalService.open(content, { windowClass: 'myCustomModalClass' });

  this.modalReference.result.then(
    (result) => {
      this.closeResult = `Closed with: ${result}`;
    },
    (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    }
  );
  }

  async updateUserConfig(userconfig: UserConfig) {
    await this.userConfigurationService.updateUserConfig(userconfig);
    this.userconfig = userconfig;
    this.closeAllForm();
    this.active = false;
    if (this.modalReference) {
      this.modalReference.close();
    }
  }

  changeDefaultVisitNote(event: any, userconfig: UserConfig) {
    if (event.target.checked) {
      this.saveUserconfig.DefaultNewDocumentVisitNote = false;
    }
  }

  changeDefaultSOAP(event: any, userconfig: UserConfig) {
    if (event.target.checked) {
      this.saveUserconfig.DefaultNewDocumentSOAP = false;
    }
  }

  getDismissReason(reason: any): string {
    this.seeMoreListNumber = 10;
    if (reason === ModalDismissReasons.ESC) {
      return 'by pressing ESC';
    } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
      return 'by clicking on a backdrop';
    } else {
      return `with: ${reason}`;
    }
  }


  closeAllForm() {
    this.soapFormDiv = false;
    this.inPatientSoapForm = false;
    this.pdfFormDiv = false;
    this.visitFormDiv = false
    this.isCreateRequest = false;
    this.isCopyRequest = false;
    this.editing = false;
    this.isCopy = false;
    this.isInPatientSoap = false;
    this.inPatientShow = false;
    this.InOutPatientViewValue = {
      showBoth: true,
      showIn: false,
      showOut: false,
    };

  }

  modelFormOpen(paitentData: any, oldversion?: boolean) {
    if (this.editing) {
      Swal.fire({
        text: "Are you sure you want to close without saving?",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes',
        cancelButtonText: 'No',
        customClass: 'myalertpopup'
      }).then((result) => {
        if (result.value) {
          this.modelOpenProcess(paitentData, paitentData.Oldversion)
        }
      })
    } else {
      this.modelOpenProcess(paitentData, paitentData.Oldversion)
    }
  }

  modifyAndOpenForm(data: any, oldversion?: boolean) {
    // Remove the 'dockey' property
    data.Dockey = data.DocKey; // Assign the new value for 'newDockey'
    
    // Add the 'newDockey' property
    delete data.DocKey;
  
    // Proceed with opening the form
    this.modelFormOpenInPatient(data, oldversion);
  }

  FormOpenInPatient(paitentData: any, oldversion?: boolean) {
    if (this.editing) {
      Swal.fire({
        text: "Are you sure you want to close without saving?",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes',
        cancelButtonText: 'No',
        customClass: 'myalertpopup'
      }).then((result) => {
        if (result.value) {
          this.modifyAndOpenForm(paitentData.value, paitentData.Oldversion)
        }
      })
    } else {
      this.modifyAndOpenForm(paitentData.value, paitentData.Oldversion)
    }
  }

  modelOpenProcess(paitentData:any, oldversion?: boolean) {
    this.oldversion = oldversion;
    this.soapPdf={};
    this.closeAllForm();
    this.patientVisitRecord = {} as PatientVisitDataResult;
    this.inPatientVisitData = {} as InPatientDataResult;
    this.inPatientSoapData = {};

    if (paitentData?.Dtid != DocType.ZMED_SOAP) {
      this.userConfigurationService
      .getPatientVisitData(paitentData.DocKey) .pipe(
        untilDestroyed(this),
        catchError((err) => {
          return of([]);
        })
      )
      .subscribe((patientResult: PatientVisitDataResult) => {
        this.patientVisitRecord = patientResult;
        if (
          this.patientVisitRecord?.Dtid == DocType.ZMED_MEDRP ||
          this.patientVisitRecord?.Released == 'X'
        ) {
          this.pdfFormOpen();
        } else if (this.patientVisitRecord?.Dtid == DocType.ZMED_SOAP) {
          this.soapFormOpen();
        } else if (this.patientVisitRecord?.Dtid == DocType.ZMED_VISIT) {
          this.visitFormOpen();
        }
        if(this.patientVisitRecord){
          this.InOutPatientViewValue = {
            showBoth: false,
            showIn: false,
            showOut: true,
          };
        }else{
          this.InOutPatientViewValue = {
            showBoth: true,
            showIn: false,
            showOut: false,
          };
        }
        this.modalService.dismissAll();
      });
    this.editing = false;
    }
  else{

    this.userConfigurationService
    .getSoapPatientVisitData(paitentData.DocKey)
    .pipe(
      untilDestroyed(this),
      catchError((err) => {
        return of([]);
      })
    )
    .subscribe((patientResult: any) => {
      this.inPatientSoapData = patientResult;
      console.log(paitentData, "left side data");
      if (paitentData.Released) {
        this.isInPatientSoap = true;
        this.inPatientForm = "OutSOAP";
        this.getReleasedPdf(this.inPatientSoapData);
        this.pdfFormOpen();
      } else {
        this.soapFormOpen();
      }

      this.InOutPatientViewValue = {
        showBoth: false,
        showIn: false,
        showOut: true,
      };
      this.modalService.dismissAll();
    });

  }
  }

  modelFormOpenInPatient(paitentData,oldversion?: boolean) {
    this.oldversion = oldversion;
    this.closeAllForm();
    this.soapPdf={};
    this.patientVisitRecord = {} as PatientVisitDataResult;
    this.inPatientVisitData = {} as InPatientDataResult;
    this.inPatientDischargeData = {}
    this.inPatientSoapData = {}
    if (paitentData?.Dtid !== 'ZMED_SOAP'&& paitentData?.Dtid !== 'ZMED_VISIT') {
      this.inPatientConfigurationService
        .getPatientVisitDataByDocKey(paitentData.Dockey)
        .pipe(
          untilDestroyed(this),
          catchError((err) => {
            return of([]);
          })
        )
        .subscribe((patientResult: InPatientDataResult) => {
          this.inPatientVisitData = patientResult;
          this.inPatientShow = false;
          this.inPatientForm = "";
          if (this.inPatientVisitData.Released) {
            this.pdfFormOpen();
          } else if (!paitentData.Released && paitentData?.Dtid !== "ZMED_ATCHM") {
            if (paitentData?.Dtid === "ZMED_OPERT") {
              this.inPatientShow = true;
              this.inPatientForm = "OPERT";
            } else if (paitentData?.Dtid === "ZMED_ORRPT") {
              this.inPatientShow = true;
              this.inPatientForm = "ORRPT";
            } else if (paitentData?.Dtid === "ZMED_SOAP") {
              this.soapFormOpen();
              this.inPatientShow = true;
              this.inPatientForm = "SOAP";
              this.inPatientSoapForm = true
            } else if (paitentData?.Dtid === "ZMED_PHDIS") {
              this.inPatientShow = true;
              this.inPatientForm = "PHDIS";
              this.inPatientConfigurationService.getPatientSummaryDataByDocKey(paitentData.Dockey).subscribe((resp) => {
                if (resp && resp.results && resp.results.length) {
                  this.inPatientDischargeData = resp;
                }
              })

            }
          } else {
            this.getReleasedPdf(this.inPatientVisitData);
            this.pdfFormOpen();
            this.inPatientShow = false;
            this.inPatientForm = "";
          }
        });
    } else if (paitentData?.Dtid == 'ZMED_SOAP') {
      this.userConfigurationService
        .getSoapPatientVisitData(paitentData.Dockey)
        .pipe(
          untilDestroyed(this),
          catchError((err) => {
            return of([]);
          })
        )
        .subscribe((patientResult: any) => {

          this.inPatientSoapData = patientResult;
          console.log(paitentData, "right side data");
          
          if (paitentData?.Released
          ) {
            this.isInPatientSoap = true;
            this.getReleasedPdf(this.inPatientSoapData);
            this.pdfFormOpen();
          } else {
            this.soapFormOpen();
            this.inPatientShow = true;
            this.inPatientForm = "SOAP";
            this.inPatientSoapForm = true
          }
        });
    }else{
      this.userConfigurationService
        .getPatientVisitData(paitentData.Dockey)
        .pipe(
          untilDestroyed(this),
          catchError((err) => {
            return of([]);
          })
        )
        .subscribe((patientResult: any) => {

          this.patientVisitRecord = patientResult;

          if (this.patientVisitRecord.Released
          ) {
            this.isInPatientSoap = true;
            this.getReleasedPdf(this.patientVisitRecord);
            this.pdfFormOpen();
          } else {
            this.visitFormOpen();
            this.inPatientShow = true;
          }
        });
    }
    this.InOutPatientViewValue = {
      showBoth: false,
      showIn: true,
      showOut: false,
    };
    this.modalService.dismissAll();
  }
  getReleasedPdf(item){

    this.admissionService.getSoapPDF(item.Dockey)
    .subscribe((_success:any)=>{
     this.soapPdf = _success?.d;
  })
  }
  openNewForm(type?: string) {

  this.editing = true;
  if (this.userconfig.DefaultNewDocumentSOAP) {
    this.inPatientSoapData = {} as PatientVisitDataResult;
    this.inPatientSoapData.DocKey = '';
    this.inPatientSoapData.Einri = this.storageService.einri;
    this.inPatientSoapData.Falnr = this.storageService.falnr;
    this.inPatientSoapData.Lfdnr = this.storageService.lfdnr;
    this.inPatientSoapData.Patnr = this.storageService.patnr;
    this.inPatientSoapData.Visitdate = new DatePipe('en-US').transform(new Date(), 'yyyy-MM-dd');
    this.soapFormDiv = false;
    this.pdfFormDiv = false;
    this.visitFormDiv = false;
    this.isCreateRequest = true;
    this.inPatientShow = false;
    this.InOutPatientViewValue = (type === 'out' && { showBoth: false, showIn: false, showOut: true, }) || (type === 'in' && { showBoth: false, showIn: true, showOut: false, });
    this.inPatientSoapData.Dtid = DocType.ZMED_SOAP;
    this.soapFormDiv = true;
    } else if (this.userconfig.DefaultNewDocumentVisitNote) {
      this.patientVisitRecord = {} as PatientVisitDataResult;
      this.patientVisitRecord.DocKey = '';
      this.patientVisitRecord.Einri = this.storageService.einri;
      this.patientVisitRecord.Falnr = this.storageService.falnr;
      this.patientVisitRecord.Lfdnr = this.storageService.lfdnr;
      this.patientVisitRecord.Patnr = this.storageService.patnr;
      this.patientVisitRecord.VisitDate = new DatePipe('en-US').transform(new Date(), 'yyyy-MM-dd');
      this.soapFormDiv = false;
      this.pdfFormDiv = false;
      this.visitFormDiv = false;
      this.isCreateRequest = true;
      this.inPatientShow = false;
      this.InOutPatientViewValue = (type === 'out' && { showBoth: false, showIn: false, showOut: true, }) || (type === 'in' && { showBoth: false, showIn: true, showOut: false, });

      this.patientVisitRecord.Dtid = DocType.ZMED_VISIT;
      this.visitFormDiv = true;
    }
  }

  soapFormOpen() {
    this.soapFormDiv = true;
  }

  pdfFormOpen() {
    this.pdfFormDiv = true;
  }

  visitFormOpen() {
    this.visitFormDiv = true;
  }

  updateForm(isUpdate: any) {
    this.InOutPatientViewValue = {
      showBoth: true,
      showIn: false,
      showOut: false,
    };
    this.closeAllForm();
    if (isUpdate) {
      this.userConfigurationService.getListOfPatientVisitDataSet();
      this.inPatientConfigurationService.getListOfAllPatientVisitDataSet();
      this.getDataByUserConfig();
    }
  }

  updateInPatientForm(isUpdate: any) {
    this.InOutPatientViewValue = {
      showBoth: true,
      showIn: false,
      showOut: false,
    };
    this.inPatientSoapForm = false;
    this.closeAllForm();
    if (isUpdate) {
      setTimeout(() => {
        
        this.getCurrentVisitDetails('1')
      }, 10000);
      
    }
  }

  copyReleaseForm(releaseData: any) {
    this.closeAllForm();
    this.inPatientDischargeData = {};
    this.isCopy = true;
    if (releaseData.DataType === "in-patient") {
      this.InOutPatientViewValue = {
        showBoth: false,
        showIn: true,
        showOut: false,
      };
      if (releaseData?.Dtid === "ZMED_PHDIS") {
        this.inPatientConfigurationService.getPatientSummaryDataByDocKey(releaseData.DocKey).subscribe((resp) => {
          if (resp && resp.results && resp.results.length) {
            this.inPatientDischargeData = resp;
          }
        })
      } else {
        this.inPatientVisitData = releaseData;
        this.inPatientSoapData = releaseData;
      }
      if (releaseData?.Dtid === "ZMED_OPERT") {
        this.inPatientShow = true;
        this.inPatientForm = "OPERT";
      } else if (releaseData?.Dtid === "ZMED_ORRPT") {
        this.inPatientShow = true;
        this.inPatientForm = "ORRPT";
      } else if (releaseData?.Dtid === "ZMED_PHDIS") {
        this.inPatientShow = true;
        this.inPatientForm = "PHDIS";
      } else if (releaseData?.Dtid === "" || releaseData?.Dtid === "ZMED_SOAP") {

        if(this.inPatientForm === "OutSOAP"){

          this.soapFormOpen();
          this.inPatientForm = "SOAP";
          this.InOutPatientViewValue = {
            showBoth: false,
            showIn: false,
            showOut: true,
          };
        }
        else{
        this.soapFormOpen();
        this.inPatientShow = true;
        this.inPatientForm = "SOAP";
        this.inPatientSoapForm = true
        }
      }
    } else {
      this.InOutPatientViewValue = {
        showBoth: false,
        showIn: false,
        showOut: true,
      };
    }
    this.isCopyRequest = releaseData;
    this.patientVisitRecord.VISITTOATTACHMENTS = undefined;
    this.patientVisitRecord.Released = '';
    if (this.patientVisitRecord?.Dtid == DocType.ZMED_SOAP) {
      this.soapFormOpen();
    } else if (this.patientVisitRecord?.Dtid == DocType.ZMED_VISIT) {
      this.visitFormOpen();
    }
  }

  formatDate(date: string) {
    return new DatePipe('en-US').transform(date, 'dd.MM.YYYY');
  }

  onChangeSearchTextValue() {
    let deep = _cloneDeep(this.patientAllRefreshdataSource);
    if (this.searchTextValue === '') {
      this.popupGridData(this.patientAllRefreshdataSource);
    } else {
      let arr = [];
      for (let i = 0; i < deep.length; i++) {
        const subjective = deep[i].ReasonForVisit;
        const objective = deep[i].Objective;
        const soapPlan = deep[i].Plann;
        const reasonForVisit = deep[i].ReasonForVisit;
        const assessment = deep[i].Assessment;
        if (
          subjective.toUpperCase().indexOf(this.searchTextValue.toUpperCase()) >
          -1 ||
          objective.toUpperCase().indexOf(this.searchTextValue.toUpperCase()) >
          -1 ||
          soapPlan.toUpperCase().indexOf(this.searchTextValue.toUpperCase()) >
          -1 ||
          reasonForVisit
            .toUpperCase()
            .indexOf(this.searchTextValue.toUpperCase()) > -1 ||
          assessment
            .toUpperCase()
            .indexOf(this.searchTextValue.toUpperCase()) > -1
        ) {
          arr.push(deep[i]);
        }
      }
      this.popupGridData(arr);
    }
  }

  onChangeSearchInpatientTextValue() {
    let deep = _cloneDeep(this.patientAllRefreshdataSource);
    if (this.searchTextValue === '') {
      this.popupGridData(this.patientAllRefreshdataSource);
    } else {
      let arr = [];
      for (let i = 0; i < deep.length; i++) {
        const DateChange = this.formatDate(deep[i].Erdattim);
        const Mitarbname = deep[i].Mitarbname;
        const Orgdo = deep[i].Orgdo;
        const DtidText = deep[i].DtidText;
        // const assessmenttext = deep[i].Assessmenttext;
        if (
          DateChange.toUpperCase().indexOf(this.searchTextValue.toUpperCase()) >
          -1 ||
          Mitarbname.toUpperCase().indexOf(this.searchTextValue.toUpperCase()) >
          -1 ||
          Orgdo.toUpperCase().indexOf(this.searchTextValue.toUpperCase()) >
          -1 ||
          DtidText
            .toUpperCase()
            .indexOf(this.searchTextValue.toUpperCase()) > -1
        ) {
          arr.push(deep[i]);
        }
      }
      this.popupGridData(arr);
    }
  }

  onClickSeeMore() {
    this.patientGridVisitdataSource = _cloneDeep(
      this.patientAllVisitdataSource
    ).slice(this.seeMoreListNumber, this.seeMoreListNumber + 10);
    this.seeMoreListNumber += 10;
  }

  onClickPrevious() {
    this.seeMoreListNumber -= 10;
    this.patientGridVisitdataSource = _cloneDeep(
      this.patientAllVisitdataSource
    ).slice(this.seeMoreListNumber - 10, this.seeMoreListNumber);
  }

  handleChangePeriodParameter(evt, type) {
    let obj;
    switch (type) {
      case 'month':
        obj = {
          month: evt.target.checked,
          date: false,
        };
        this.periodParameterCheckValue = obj;
        this.saveUserconfig.PeriodParameterFromDate = '';
        this.saveUserconfig.PeriodParameterToDate = '';
        this.saveUserconfig.PeriodParameterMonth =
          this.periodParameterMonthSelectValue;
        break;
      case 'date':
        obj = {
          month: false,
          date: evt.target.checked,
        };
        this.periodParameterCheckValue = obj;
        this.saveUserconfig.PeriodParameterMonth = '';
        break;

      default:
        break;
    }
  }

  handleChangePeriodParameterMonthSelect(evt) {
    this.saveUserconfig.PeriodParameterMonth = evt.target.value;
  }
  // in patient start
  openNewFormForInPatient(formType: string) {
    if (formType === "OPERT") {
      this.inPatientForm = "OPERT";
    } else if (formType === "ORRPT") {
      this.inPatientForm = "ORRPT";
    } else if (formType === "PHDIS") {
      this.inPatientForm = "PHDIS";
    }
    this.inPatientShow = true;
    this.InOutPatientViewValue = {
      showBoth: false,
      showIn: true,
      showOut: false,
    };
    this.inPatientVisitData = {} as InPatientDataResult;
    this.inPatientDischargeData = {}
  }

  loadinPatientPanel(event: any) {
    this.inPatientShow = event.isinvalid;
    this.InOutPatientViewValue = {
      showBoth: event.isvalid,
      showIn: event.isinvalid,
      showOut: event.isinvalid,
    };
  }

  onOpenAttachment(attachmentId: any) {
    this.inPatientVisitData = {} as InPatientDataResult;
    this.patientVisitRecord = {} as PatientVisitDataResult;
    this.userConfigurationService.getAttachmentVisitData(attachmentId).subscribe((data) => {
      if (data) {
        this.oldversion = true;
        this.patientVisitRecord = { ...data, DOCCATTOATTACHMENTS: { results: [data] } };
        this.pdfFormOpen();
        this.InOutPatientViewValue = {
          showBoth: false,
          showIn: false,
          showOut: true,
        };
      }
    })
  }

  onInPatientAttachment(attachmentId: any) {
    this.inPatientVisitData = {} as InPatientDataResult;
    this.patientVisitRecord = {} as PatientVisitDataResult;
    this.userConfigurationService.getAttachmentVisitData(attachmentId).subscribe((data) => {
      if (data) {
        this.oldversion = true;
        this.patientVisitRecord = { ...data, DOCCATTOATTACHMENTS: { results: [data] } };
        this.pdfFormOpen();
        this.InOutPatientViewValue = {
          showBoth: false,
          showIn: true,
          showOut: false,
        };
      }
    })
  }

  onReleaseHistoryData(releaseId: any) {
    this.inPatientVisitData = {} as InPatientDataResult;
    this.patientVisitRecord = {} as PatientVisitDataResult;
    this.userConfigurationService.getReleaseHistoryData(releaseId).subscribe((data) => {
      if (data && data.length) {
        this.diagnosisHistory.showPopup(data)
      }
    })
  }
  base64Value: string;
  mimetype: any;
  filename: any;
  file: File;
  selectedFile: File | null = null;
  documentUrl: SafeResourceUrl | null = null;
  public openModalForAttachment(
    template: TemplateRef<any>,
  ) {
    this.removeFile();
    const config: ModalOptions = { class: 'modal-dialog-centered attachment-modal' };
      this.modalRef = this.modalServiceForAllergy.show(template,config);
      this.modalRef.hide();
      this.userProfile = this.storageService.getUserProfile();
      this.modalRef.onHide.subscribe((reason: string | any) => {
        if(reason === 'backdrop-click') {
        }
      });

  }
  convertFile(file: File): Observable<string> {
    const result = new ReplaySubject<string>(1);
    const reader = new FileReader();
    reader.readAsBinaryString(file);
    reader.onload = (event) =>
      result.next(btoa(event.target.result.toString()));
    return result;
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
    this.modalServiceForAllergy.show(template, config);
    const fileReader = new FileReader();
    fileReader.onload = (e) => {
      this.documentUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
        ((e.target as FileReader).result as string)
      );
    };
    fileReader.readAsDataURL(this.file);
  }
}
resetAttachment(){
  this.modalRef.hide();
  this.createAttachmentForm.reset();
}
getAttachmentsList() {
  this.patientHistoryService.getAttachmentsList().subscribe(
    (_success: any) => {
     this.attachmentList = _success.d.results;

    },
    (_error: any) => {}
  );
}
createAttachmentDoc(){
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
      Swal.fire({
        title: 'Created Successfully',
        icon: 'success',
        confirmButtonText: 'OK',
      });
    },
    (_error: any) => {}
  );
}
 // Sort by keys (alphabetically)
 sortKeys(a: KeyValue<string, any>, b: KeyValue<string, any>): number {
  return b.key.localeCompare(a.key);
}
}
