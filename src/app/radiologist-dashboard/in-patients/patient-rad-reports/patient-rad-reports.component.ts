import {
  Component,
  OnInit,
  Input,
  ViewChild,
  TemplateRef,
  Output,
  EventEmitter,
} from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { EEmrService } from '@services/e-emr.service';
import { HospitalistService } from '@services/e-hospitalist/hospitalist.service';
import { BsModalRef, BsModalService, ModalOptions } from 'ngx-bootstrap/modal';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-patient-rad-reports',
  templateUrl: './patient-rad-reports.component.html',
  styleUrls: ['./patient-rad-reports.component.scss'],
})
export class PatientRadReportsComponent implements OnInit {
  @Input() radPatientList;
  @Output() reloadTableData = new EventEmitter();;
  modalRef: BsModalRef;
  @ViewChild('labpdfmodal') labpdfmodal: TemplateRef<HTMLDivElement>;
  @ViewChild('imageModal') imageModal: TemplateRef<HTMLDivElement>;

  pdfUrl: any;
  columnsList: any[] = [
    'Created On',
    'Created At',
    'Created By',
    'MRN',
    'Patient',
    'Ward',
    'Room/Bad',
    'Order Description',
    'Result Status',
    'Image',
    'Report',
    'Abnormal',
  ];
  record: any;
  text: string;
  checkedFlag: any;
  imageUrl: any;

  constructor(
    private _dataServices: EEmrService,
    private sanitizer: DomSanitizer,
    private modalService: BsModalService,
    private hospitalistService: HospitalistService
  ) {}

  ngOnInit(): void {}

  getDate(value) {
    if (value) {
      var str = value;
      var num = parseInt(str.replace(/[^0-9]/g, ''));
      var date = new Date(num);
      return date;
    }
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
            class: 'modal-dialog-centered modal-lg',
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
    let jsonObj: any = {
      Dockey: data.Dockey
    };
    this.hospitalistService.getCheckPDF(jsonObj).subscribe(
      (_success: any) => {
        if (_success) {
          this.reloadTableData.next('radTable');
        }
      },
      (_error: any) => {}
    );
  }

  openImageActionSet(data){
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

  redirectToeKardex(data) {
    window.open(
      'radiologist-ekardex?patnr=' +
      data.Patnr +
      '&falnr=' +
      data.Falnr
      +
      '&einri=' +
      data.Einri +
      '&lfdnr=' + data.Lfdnr,
      '_blank'
    );
  }
  
  closeImageModal(){
    this.modalRef.hide();
  }
}
