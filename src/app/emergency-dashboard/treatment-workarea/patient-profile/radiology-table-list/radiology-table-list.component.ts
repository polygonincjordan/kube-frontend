import { Component, OnInit, Input, OnChanges, SimpleChanges, TemplateRef, ViewChild, Output, EventEmitter } from '@angular/core';
import { EEmrService } from '@services/e-emr.service';
import { EmergencyService } from '@services/emergency-dashboard/emergency-service';
import { eOrderService } from '@services/eorder.service';
import { StorageService } from '@services/storage.service';
import { DomSanitizer } from '@angular/platform-browser';
import { BsModalRef, BsModalService, ModalOptions } from 'ngx-bootstrap/modal';
import Swal from 'sweetalert2';
import { HospitalistService } from '@services/e-hospitalist/hospitalist.service';
@Component({
  selector: 'app-radiology-table-list',
  templateUrl: './radiology-table-list.component.html',
  styleUrls: ['./radiology-table-list.component.scss']
})
export class RadiologyTableListComponent implements OnInit, OnChanges {
  @ViewChild('labpdfmodal') labpdfmodal: TemplateRef<HTMLDivElement>;
  @Output() reloadTableData = new EventEmitter();
  @Output() deleteItem = new EventEmitter<any>();

  @Input() radiologyList: any;
  @Input() searchString: any;
  modalRef: BsModalRef;

  columnList: any[] = [
    'Service Description',
    'Category',
    'Order Date',
    'Order Time',
    'Desired Date',
    'Desired Time',
    'Status',
    'Comments',
    'Created By',
    'Action',
    'Delete',
  ];
  isCollpseOpen: boolean;
  record: any;
  imageUrl: any;
  pdfUrl: any;
  checkedFlag: any;
  text: string;
  cancelReasons: any[] = [];
  constructor(
    public emergencyService: EmergencyService,
    private _dataServices: EEmrService,
    private modalService: BsModalService,
    private hospitalistService: HospitalistService,
    private sanitizer: DomSanitizer,
    public eorderService: eOrderService,
    private storageService: StorageService
  ) {}

  ngOnInit(): void {
    this.getCancelReasons();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.radiologyList.currentValue?.length) {
      this.isCollpseOpen = true;
    } else {
      this.isCollpseOpen = false;
    }
  }

  openImageActionSet(data){
    console.log(data, "--")
    this.record = data;
    let jsonObj = {
      ActionXml:"<?xml version=\"1.0\" encoding=\"utf-16\"?><asx:abap version=\"1.0\" xmlns:asx=\"http://www.sap.com/abapxml\"><asx:values><OUTPUT><ACTIONID>ROWCLICK</ACTIONID><SOURCEDATA>&lt;?xml version=&apos;1.0&apos;?&gt;&lt;asx:abap&gt;&lt;asx:values&gt;&lt;OUTPUT&gt;&lt;RN1WPV007_FIELDCAT&gt;&lt;EINRI&gt;1000&lt;/EINRI&gt;&lt;PATNR&gt;0000167289&lt;/PATNR&gt;&lt;PNAMEC&gt;Abdin, Nisreen Abdelwadod A&lt;/PNAMEC&gt;&lt;GSCHLE&gt;F&lt;/GSCHLE&gt;&lt;AGEPAT&gt;45&lt;/AGEPAT&gt;&lt;GPART&gt;9000000671&lt;/GPART&gt;&lt;FALNR&gt;0000628467&lt;/FALNR&gt;&lt;FALAR&gt;2&lt;/FALAR&gt;&lt;FALAR_TXT&gt;Outpatient&lt;/FALAR_TXT&gt;&lt;EBGDT&gt;2023-01-14&lt;/EBGDT&gt;&lt;EBZT&gt;13:36:53&lt;/EBZT&gt;&lt;CORDERID&gt;19AB7674818D1EDDA4FEEB80D2B93E10&lt;/CORDERID&gt;&lt;VKGID&gt;00481288&lt;/VKGID&gt;&lt;LNRLS/&gt;&lt;LFDBEW&gt;00001&lt;/LFDBEW&gt;&lt;LEISTUNG&gt;HCLB00045, HCLB00041&lt;/LEISTUNG&gt;&lt;LEITXT&gt;Partial Thromboplastin Time (PTT), Prothrombin Time (PT-INR)&lt;/LEITXT&gt;&lt;DIAGNOSIS/&gt;&lt;STATUS/&gt;&lt;STATUS_TXT/&gt;&lt;ZZRESULT_STATUS/&gt;&lt;ZZRESULT_STATUS_TEXT&gt;Completed with abnormal&lt;/ZZRESULT_STATUS_TEXT&gt;&lt;ZZN2DOC_KEY&gt;LAB000000000000001000230960401000&lt;/ZZN2DOC_KEY&gt;&lt;ZZLAB_RAD_CHECKED&gt;check_box_outline_blank@Click to set status &quot;Checked&quot;&lt;/ZZLAB_RAD_CHECKED&gt;&lt;ZZLAB_RAD_REPORT&gt;picture_as_pdf@Lab Report PDF&lt;/ZZLAB_RAD_REPORT&gt;&lt;ZZABNMRLPANICEXIST&gt;X&lt;/ZZABNMRLPANICEXIST&gt;&lt;ZZABNMRLPANICEXIST_LOGO&gt;circle icon_red@Abnrmal result exists.&lt;/ZZABNMRLPANICEXIST_LOGO&gt;&lt;/RN1WPV007_FIELDCAT&gt;&lt;/OUTPUT&gt;&lt;/asx:values&gt;&lt;/asx:abap&gt;</SOURCEDATA><FIELDNAME>ZZLAB_RAD_REPORT</FIELDNAME></OUTPUT></asx:values></asx:abap>",
      Actionid: "ZNIMAGE",
      Widgetid:"MYRAD01",
      New:"X",
      Dockey: data.Dockey,
      DockeyImg:data.DockeyImg
    }
    this._dataServices.widgetResponseSet(jsonObj).subscribe(
      (_success: any) => {
        if (_success) {
       //this.filterData();
       this.imageUrl = this.sanitizer.bypassSecurityTrustResourceUrl(_success.d.Url);
       window.open(_success.d.Url, '_blank');
      //  const config: ModalOptions = { class: 'modal-dialog-centered modal-lg' };
      //  this.modalRef = this.modalService.show(this.imageModal,config);
     }
      },
      (_error: any) => {}
    );
  }

  getPdf(data) {
    this.record = data;
    let jsonObj = {
      ActionXml:"<?xml version=\"1.0\" encoding=\"utf-16\"?><asx:abap version=\"1.0\" xmlns:asx=\"http://www.sap.com/abapxml\"><asx:values><OUTPUT><ACTIONID>ROWCLICK</ACTIONID><SOURCEDATA>&lt;?xml version=&apos;1.0&apos;?&gt;&lt;asx:abap&gt;&lt;asx:values&gt;&lt;OUTPUT&gt;&lt;RN1WPV007_FIELDCAT&gt;&lt;EINRI&gt;1000&lt;/EINRI&gt;&lt;PATNR&gt;0000167289&lt;/PATNR&gt;&lt;PNAMEC&gt;Abdin, Nisreen Abdelwadod A&lt;/PNAMEC&gt;&lt;GSCHLE&gt;F&lt;/GSCHLE&gt;&lt;AGEPAT&gt;45&lt;/AGEPAT&gt;&lt;GPART&gt;9000000671&lt;/GPART&gt;&lt;FALNR&gt;0000628467&lt;/FALNR&gt;&lt;FALAR&gt;2&lt;/FALAR&gt;&lt;FALAR_TXT&gt;Outpatient&lt;/FALAR_TXT&gt;&lt;EBGDT&gt;2023-01-14&lt;/EBGDT&gt;&lt;EBZT&gt;13:36:53&lt;/EBZT&gt;&lt;CORDERID&gt;19AB7674818D1EDDA4FEEB80D2B93E10&lt;/CORDERID&gt;&lt;VKGID&gt;00481288&lt;/VKGID&gt;&lt;LNRLS/&gt;&lt;LFDBEW&gt;00001&lt;/LFDBEW&gt;&lt;LEISTUNG&gt;HCLB00045, HCLB00041&lt;/LEISTUNG&gt;&lt;LEITXT&gt;Partial Thromboplastin Time (PTT), Prothrombin Time (PT-INR)&lt;/LEITXT&gt;&lt;DIAGNOSIS/&gt;&lt;STATUS/&gt;&lt;STATUS_TXT/&gt;&lt;ZZRESULT_STATUS/&gt;&lt;ZZRESULT_STATUS_TEXT&gt;Completed with abnormal&lt;/ZZRESULT_STATUS_TEXT&gt;&lt;ZZN2DOC_KEY&gt;LAB000000000000001000230960401000&lt;/ZZN2DOC_KEY&gt;&lt;ZZLAB_RAD_CHECKED&gt;check_box_outline_blank@Click to set status &quot;Checked&quot;&lt;/ZZLAB_RAD_CHECKED&gt;&lt;ZZLAB_RAD_REPORT&gt;picture_as_pdf@Lab Report PDF&lt;/ZZLAB_RAD_REPORT&gt;&lt;ZZABNMRLPANICEXIST&gt;X&lt;/ZZABNMRLPANICEXIST&gt;&lt;ZZABNMRLPANICEXIST_LOGO&gt;circle icon_red@Abnrmal result exists.&lt;/ZZABNMRLPANICEXIST_LOGO&gt;&lt;/RN1WPV007_FIELDCAT&gt;&lt;/OUTPUT&gt;&lt;/asx:values&gt;&lt;/asx:abap&gt;</SOURCEDATA><FIELDNAME>ZZLAB_RAD_REPORT</FIELDNAME></OUTPUT></asx:values></asx:abap>",
      Actionid: "ZNPDF",
      Widgetid:"MYRAD01",
      New:"X",
      Fieldname:"ZZLAB_RAD_REPORT",
      Dockey: data.Dockey,
    };
    this._dataServices.widgetResponseSet(jsonObj).subscribe(
      (_success: any) => {
        if (_success) {
          this.pdfUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
            _success.d.Url
          );
          const config: ModalOptions = {
            class: 'modal-dialog-centered modal-xl',
          };
          this.modalRef = this.modalService.show(this.labpdfmodal, config);
        }
      },
      (_error: any) => {}
    );
  }

  closePdfModal() {
    this.modalRef.hide();
    this.confirmationMarkAsChecked(this.record);
  }

  confirmationMarkAsChecked(data) {
    this.checkedFlag = null;
    if (data.Status == 'Completed') {
      this.text = 'You have viewed the document. Do you wish the status to be checked ?';
      Swal.fire({
        title: 'Confirm',
        text: this.text,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes',
        cancelButtonText: 'No',
      }).then((result) => {
        if (result.value) {
          this.markAsChecked(data);
        }
        this.checkedFlag = false;
      });
    } else {
      this.text = '<p style="font-size:1.125em">You have viewed the document. Do you wish the status to be checked? Caution: Order has <span style="color:red">Panic/Abnormal</span> result!</p>';
      Swal.fire({
        title: 'Confirm',
        html: this.text,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes',
        cancelButtonText: 'No',
      }).then((result) => {
        if (result.value) {
          this.markAsChecked(data);
        }
        this.checkedFlag = false;
      });
    }
  }

  markAsChecked(data: any) {
    this.getPDFCheck(data);
  }

  getPDFCheck(data) {
    let jsonObj: any = {
      Dockey: data.Dockey
    };
    this.hospitalistService.getCheckPDF(jsonObj).subscribe(
      (_success: any) => {
        if (_success) {
          this.modalRef.hide();
          this.reloadTableData.emit('radTable');
        }
      },
      (_error: any) => {}
    );  
  }

  getCancelReasons() {
    this.hospitalistService.cancelReasonList().subscribe(
      (response: any) => {
        if (response && response.d && response.d.results) {
          this.cancelReasons = response.d.results;
        }
      },
      (error) => {
        console.error('Error fetching cancel reasons:', error);
      }
    );
  }

  deleteOrderItem(item: any) {
    if (!item) {
      return;
    }

    const reasonsOptions = this.cancelReasons.reduce((obj, reason) => {
      obj[reason.Stoid] = reason.N1stotx;
      return obj;
    }, {} as any);

    let selectedReasonId: any = null;

    Swal.fire({
      title: 'Delete Order Service',
      html: `
        <div style="text-align: left; margin: 20px 0;">
          <p style="font-weight: 500; margin-bottom: 15px;">Are you sure you want to delete</p>
          <select id="reason-select" class="swal2-input w-100" style="border: 2px solid #dc3545;" required>
            <option value="" selected disabled>Please Select Reason</option>
            ${Object.entries(reasonsOptions)
              .map(([key, value]) => `<option value="${key}">${value}</option>`)
              .join('')}
          </select>
          <div id="reason-error" style="color: #dc3545; font-size: 14px; margin-top: 8px; display: none;">
            Please Select Reason
          </div>
        </div>
      `,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Delete',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#dc3545',
      cancelButtonColor: '#6c757d',
      customClass: { popup: 'myalertpopup' },
      didOpen: () => {
        const selectElement = document.getElementById(
          'reason-select'
        ) as HTMLSelectElement;
        selectElement?.addEventListener('change', (e: any) => {
          selectedReasonId = e.target.value;
          const errorDiv = document.getElementById('reason-error');
          if (errorDiv) {
            errorDiv.style.display = 'none';
          }
        });
      },
      preConfirm: () => {
        const selectElement = document.getElementById(
          'reason-select'
        ) as HTMLSelectElement;
        const errorDiv = document.getElementById('reason-error');

        if (!selectElement?.value) {
          if (errorDiv) {
            errorDiv.style.display = 'block';
          }
          return false;
        }
        return true;
      },
    }).then((result) => {
      if (result.isConfirmed && selectedReasonId) {
        const selectedReason = this.cancelReasons.find(
          (r) => r.Stoid === selectedReasonId
        );
        if (selectedReason) {
          this.performDelete(item, selectedReason);
        }
      }
    });
  }

  private performDelete(item: any, reason: any) {
    const { einri, falnr, lfdnr } = this.getEncounterIds();

    const postObject: any = {
      einri,
      falnr,
      lfdnr,
      Eorderid: item.Eorderid || item.EorderId || '',
      IsGroup: item.Leistung && item.Leistung.includes(',') ? 'X' : '',
      TOLABSET: [],
      TORADSET: [
        {
          Cordtypid:
            item.Cordtypid && item.Cordtypid.replace
              ? item.Cordtypid.replace(/-/g, '')
              : '',
          Eorderid: item.Eorderid || '',
          Eorderitemid: item.Eorderitemid || '',
          Talst: item.Leistung || '',
          Trtoe: item.Trtoe || '',
          Storn: 'X',
          Reason: reason.Stoid || reason,
        },
      ],
      TOSUGSET: [],
      TOMEDICSET: [],
      TOCONSET: [],
    };

    this.eorderService.deleteOrderItemFromProfile(
      postObject,
      () => {
        this.reloadTableData.emit('radTable');
      },
      () => {}
    );
  }

  private getEncounterIds(): { einri: string; falnr: string; lfdnr: string } {
    let einri = this.storageService.getLocal('einri') || this.storageService.einri || '1000';
    let falnr = this.storageService.getLocal('falnr') || this.storageService.falnr || '0000';
    let lfdnr = this.storageService.getLocal('lfdnr') || this.storageService.lfdnr || '0000';

    if (typeof window !== 'undefined') {
      try {
        const url = new URL(window.location.href);
        einri = url.searchParams.get('einri') || einri;
        falnr = url.searchParams.get('falnr') || falnr;
        lfdnr = url.searchParams.get('lfdnr') || lfdnr;
      } catch {
        // ignore URL parsing errors and fall back to storage values
      }
    }

    return { einri, falnr, lfdnr };
  }
}
