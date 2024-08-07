import { DatePipe } from '@angular/common';
import { Component, EventEmitter, OnDestroy, OnInit, Output, TemplateRef, ViewChild } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { AdmissionService } from '@services/admission/admission.service';
import { ConsumableService } from '@services/consumables/consumable.service';
import { PatientWithouConsumables } from '@services/consumables/interfaces/consumables.interface';
import { NoReleasedMissedDocuments } from '@services/consumables/interfaces/no-documents.inteface';
import { DataShareService } from '@services/data-share.service';
import { ActionType, FilterType, RedirectionType } from '@services/interfaces/common.enum';
import { SharedService } from '@services/shared.service';
import { StorageService } from '@services/storage.service';
import { BsModalRef, BsModalService, ModalOptions } from 'ngx-bootstrap/modal';

@Component({
  selector: 'app-patient-without-documents',
  templateUrl: './patient-without-documents.component.html',
  styleUrls: ['./patient-without-documents.component.scss']
})
export class PatientWithoutDocumentsComponent implements OnInit, OnDestroy {

  @Output() redirectCheckInData = new EventEmitter<any>();
  @Output() sendErNoDocumentCount = new EventEmitter<any>();

  @ViewChild('releasepdfmodal') releasepdfmodal: TemplateRef<HTMLDivElement>;
  @ViewChild('selectIconPdf', { static: true }) selectIconPdf: TemplateRef<any>;

  public noReleasedMissedDocumentsList: Array<NoReleasedMissedDocuments> = [];
  public filterNoReleaseMissDoc: Array<NoReleasedMissedDocuments> = [];
  public financialCategory: Array<any> = [];
  public statusList: Array<any> = [];
  public statusValueArr: Array<any> = [];
  public categoryValueArr: Array<any> = [];

  public isFormValidError: boolean = false;
  public searchString: string = '';

  // Sorting properties
  public sortColumn: string = '';
  public sortDirection: string = 'asc'; // Default sorting direction
  public RedirectionType: any;
  public ActionType: any;
  public modalRef: BsModalRef;
  public pdfUrl: any;
  public pdfUrlType: string;
  public releaseDocumentImage: string;
  public htmlData: any;
  public selectedIconPdf: BsModalRef;
  public documentUrl: SafeResourceUrl | null = null;

  constructor(
    private consumableService: ConsumableService,
    private storageService: StorageService,
    private dataShareService: DataShareService,
    private admissionService: AdmissionService,
    private modalService: BsModalService,
    private sanitizer: DomSanitizer,
    private sharedService: SharedService,
  ) {
    this.RedirectionType = RedirectionType;
    this.ActionType = ActionType;
  }

  ngOnDestroy(): void {

  }

  ngOnInit(): void {
    this.dataShareService.sendFilterType(null);
    this.getPatientWithoutDocuments([new Date() , new Date()]);
  }

  public getPatientWithoutDocuments(date?:any[]) {
    const json = {
      Deptcode:'2',
      Datege :`${new DatePipe('en-US').transform(
        date ?  date[0] : new Date().setDate(new Date().getDate()),
        'yyyy-MM-dd'
      )}T00:00:00`,
      Datele:`${new DatePipe('en-US').transform(
        date ?  date[1]  :new Date().setDate(new Date().getDate()),
        'yyyy-MM-dd'
      )}T00:00:00`,
    };
    this.consumableService.getMissedDocsSet(json).subscribe({
      next: (resp: any) => {
        if (resp && resp) {
          this.noReleasedMissedDocumentsList = this.filterNoReleaseMissDoc = resp.d.results;
          this.noReleasedMissedDocumentsList.forEach((ele: any) => {
            this.financialCategory.push(ele?.FinancecategoryName);
            this.statusList.push(ele?.StatusText);
          });
          // this.financialCategory = Array.from(new Set(this.financialCategory.filter(category => category.trim() !== '')));
          this.statusList = Array.from(new Set(this.statusList.filter(category => category.trim() !== '')));
          const value = {
            filterStatusList: this.statusList
          };
          this.dataShareService.sendFilterType(FilterType.PatientWithNoDocuments$, true, value);
          this.sendErNoDocumentCount.emit(this.noReleasedMissedDocumentsList.length);
        }
      }
    });
  }

  public getDate(value) {
    if (value) {
      var str = value;
      var num = parseInt(str.replace(/[^0-9]/g, ''));
      var date = new Date(num);
      return date;
    }
  }

  public getTime(value) {
    if (value) {
      var str = value;
      var str = str.replace(/[PT]/g, '');
      var str = str.replace(/[H]/g, ':');
      var str = str.replace(/[M]/g, ':');
      var str = str.replace(/[S]/g, '');
      var str = str.split(':');
      var finalstr = str[0] + ':' + str[1];
      return finalstr;
    }
  }


  public filterPatients(): void {
    // Convert the search string to lowercase for case-insensitive search
    const searchValue = this.searchString.toLowerCase().trim();

    // Filter the patient list based on the search string
    this.filterNoReleaseMissDoc = this.noReleasedMissedDocumentsList.filter(patient => {
      // Perform a case-insensitive search on each property of the patient object
      return Object.values(patient).some(value => {
        return typeof value === 'string' && value.toLowerCase().includes(searchValue);
      });
    });
    this.sendErNoDocumentCount.emit(this.filterNoReleaseMissDoc.length);
  }


  public sortTable(column: string) {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }

    this.noReleasedMissedDocumentsList.sort((a, b) => {
      const aValue = a[column];
      const bValue = b[column];

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return aValue.localeCompare(bValue) * (this.sortDirection === 'asc' ? 1 : -1);
      } else {
        return (aValue - bValue) * (this.sortDirection === 'asc' ? 1 : -1);
      }
    });
  }

  public redirectToDocuments(data: any, type: string, action: string) {
    const json = {
      Patnr: data.Patient,
      Einri: data.Einri,
      Falnr: data.Falnr.toString().padStart(10, '0'),
      Lfdnr: '00001',
      redirectFor: 'Documentation',
      doctype: type,
      action: action
    };

    // Store data in local storage for later retrieval if needed
    this.storageService.setCheckinData(data);
    localStorage.setItem('checkindata', JSON.stringify(data));
    localStorage.setItem('tabName', 'Documentation');

    // Determine and set the appropriate DocKey based on the type and condition


    // Call the appropriate function based on the action
    if (action !== ActionType.View$) {
      this.redirectToTreatment(json);
    } else {
      switch (type) {
        case RedirectionType.DIALYSIS$:
          this.getReleasedPdf('PDF', `${data.ZmedDialyDoknr}`);
          break;
        case RedirectionType.BRADEN$:
          this.getReleasedPdf('HTML', `${data.ScaBradenDoknr}`);
          break;
        case RedirectionType.MORSE$:
          this.getReleasedPdf('HTML', `${data.ScaMorseDoknr}`);
          break;
        case RedirectionType.HBCA$:
          this.getReleasedPdf('PDF', `${data.ZmedHbcaDoknr}`);
          break;
        case RedirectionType.HBFG$:
          this.getReleasedPdf('PDF', `${data.ZmedHbfgDoknr}`);
          break;
        default:
          // Handle other cases if needed
          break;
      }
    }
  }


  public getReleasedPdf(AttMimeType, Dockey) {
    if (AttMimeType == 'PDF' || AttMimeType == 'url' || AttMimeType == 'image/bmp' || AttMimeType == 'HTML') {
      this.admissionService.getPatientProfilePDF(Dockey).subscribe((_success: any) => {
        if (AttMimeType == 'PDF') {
          // this.pdfUrl = this.sanitizer.bypassSecurityTrustResourceUrl('data:application/pdf;base64,' + _success.d.AttachmentData);
          const config: ModalOptions = {
            class: 'modal-dialog-centered modal-xl pdfmodal-size',
          };
          this.modalRef = this.modalService.show(this.releasepdfmodal, config);
          this.pdfUrlConvertToBlob(_success?.d?.AttachmentData);
          this.pdfUrlType = 'pdf';
        } else if (AttMimeType == 'url') {
          window.open(_success.d.Url);
        } else if (AttMimeType == 'image/bmp') {
          const config: ModalOptions = {
            class: 'modal-dialog-centered modal-xl pdfmodal-size',
          };
          this.releaseDocumentImage = 'data:image/png;base64,' + _success.d.AttachmentData;
          this.modalRef = this.modalService.show(this.releasepdfmodal, config);
          this.pdfUrlType = 'image';
        } else if (AttMimeType == 'HTML') {
          const config: ModalOptions = {
            class: 'modal-dialog-centered modal-xl pdfmodal-size',
          };
          this.modalRef = this.modalService.show(this.releasepdfmodal, config);
          this.htmlData = this.sanitizer.bypassSecurityTrustHtml(_success.d.AttachmentDataStr);
          this.pdfUrlType = 'html';
        }
      }, (error: any) => {
        // Implement error handling logic here (e.g., show error message)
        // For example, notify user about the error or log it for further investigation
        if (error.error.error.code == '/IWBEP/CM_MGW_RT/020') {
          this.sharedService.errorSwallModel(`Error fetching patient profile : ${error.error.error.message.value}`)
        }
      });
    }
  }

  public pdfUrlConvertToBlob(pdfValue) {
    let byteArray = new Uint8Array(atob(pdfValue).split("").map(char => char.charCodeAt(0)));
    let file = new Blob([byteArray], { type: "application/pdf" });
    this.pdfUrl = file;
  }

  public redirectToTreatment(data) {
    this.redirectCheckInData.emit(data);
  }

  public closePdfModal() {
    this.releaseDocumentImage = '';
    this.modalRef.hide();
  }

  public filterListData(event) {
    let filterValue = this.filterNoReleaseMissDoc;
    if ((event.Status && event.Status != '') || (event.FCategory && event.FCategory != '')) {
      if (event.Status && event.Status.length) {
        this.statusValueArr = event.Status.map((statusValue) => {
          return filterValue.filter((element: any) => {
            const statusText = element.StatusText ? element.StatusText.trim().toLowerCase() : ''; // Handle undefined or missing StatusText
            return statusText === statusValue.trim().toLowerCase();
          });
        });
      }

      if (event.FCategory && event.FCategory.length) {
        this.categoryValueArr = event.FCategory.map((categoryValue) => {
          return filterValue.filter((element: any) => {
            const financeCategory = element.FinancecategoryName ? element.FinancecategoryName.trim().toLowerCase() : ''; // Handle undefined or missing FinancecategoryName
            return financeCategory === categoryValue.trim().toLowerCase();
          });
        });
      }

      // Flatten the arrays
      filterValue = this.flattenArrays([...this.statusValueArr, ...this.categoryValueArr]);

      this.noReleasedMissedDocumentsList = filterValue;
      this.sendErNoDocumentCount.emit(this.noReleasedMissedDocumentsList.length);
    } else {
      // Reset the filter and show all patients
      this.noReleasedMissedDocumentsList = this.filterNoReleaseMissDoc;
      this.sendErNoDocumentCount.emit(this.noReleasedMissedDocumentsList.length);
    }
  }

  private flattenArrays(arrays: any[][]): any[] {
    return arrays.reduce((acc, val) => acc.concat(val), []);
  }



}
