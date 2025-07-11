import { Component, OnInit, Input, ViewChild, TemplateRef, OnChanges, SimpleChanges } from '@angular/core';
import { EEmrService } from '@services/e-emr.service';
import { HospitalistService } from '@services/e-hospitalist/hospitalist.service';
import { EmergencyService } from '@services/emergency-dashboard/emergency-service';
import { BsModalRef, BsModalService, ModalOptions } from 'ngx-bootstrap/modal';
import { DomSanitizer } from '@angular/platform-browser';
import Swal from 'sweetalert2';
import * as _ from 'lodash';
import { environment } from 'src/environments/environment';
@Component({
  selector: 'app-laboratory-table-list',
  templateUrl: './laboratory-table-list.component.html',
  styleUrls: ['./laboratory-table-list.component.scss']
})
export class LaboratoryTableListComponent implements OnInit ,OnChanges{

  @ViewChild('labpdfmodal') labpdfmodal: TemplateRef<HTMLDivElement>;

  @Input() searchString: any;
  @Input() laboratoryList: any[] = [];
  laboratoryList1: any[] = [];
  columnList: any[] = [
    'Service Description',
    'Category',
    'Order Date',
    'Order Time',
    'Desired Date',
    'Desired Time',
    'Status',
    'Comments',
    'Action',
    'Details',
  ];
  record: any;
  pdfUrl: any;
  modalRef: BsModalRef;
  checkedFlag: any;
  text: string;
  laboratoryDetails: any;
  phyOrderData: any;
  isCollpseOpen: boolean = true;

  constructor(public emergencyService: EmergencyService,
    private _dataServices: EEmrService,
    private sanitizer: DomSanitizer,
    private modalService: BsModalService,
    private hospitalistService: HospitalistService) {}

  ngOnInit(): void {
   
  }
  
  ngOnChanges(changes: SimpleChanges): void {
    if(changes.laboratoryList.currentValue.length) {
      this.isCollpseOpen = true;
    } else {
      this.isCollpseOpen = false;
    }
  }

  
  getPdf(data) {
    this.record = data;
    let jsonObj = {
      ActionXml:
        '<?xml version="1.0" encoding="utf-16"?><asx:abap version="1.0" xmlns:asx="http://www.sap.com/abapxml"><asx:values><OUTPUT><ACTIONID>ROWCLICK</ACTIONID><SOURCEDATA>&lt;?xml version=&apos;1.0&apos;?&gt;&lt;asx:abap&gt;&lt;asx:values&gt;&lt;OUTPUT&gt;&lt;RN1WPV007_FIELDCAT&gt;&lt;EINRI&gt;1000&lt;/EINRI&gt;&lt;PATNR&gt;0000167289&lt;/PATNR&gt;&lt;PNAMEC&gt;Abdin, Nisreen Abdelwadod A&lt;/PNAMEC&gt;&lt;GSCHLE&gt;F&lt;/GSCHLE&gt;&lt;AGEPAT&gt;45&lt;/AGEPAT&gt;&lt;GPART&gt;9000000671&lt;/GPART&gt;&lt;FALNR&gt;0000628467&lt;/FALNR&gt;&lt;FALAR&gt;2&lt;/FALAR&gt;&lt;FALAR_TXT&gt;Outpatient&lt;/FALAR_TXT&gt;&lt;EBGDT&gt;2023-01-14&lt;/EBGDT&gt;&lt;EBZT&gt;13:36:53&lt;/EBZT&gt;&lt;CORDERID&gt;19AB7674818D1EDDA4FEEB80D2B93E10&lt;/CORDERID&gt;&lt;VKGID&gt;00481288&lt;/VKGID&gt;&lt;LNRLS/&gt;&lt;LFDBEW&gt;00000&lt;/LFDBEW&gt;&lt;LEISTUNG&gt;HCLB00045, HCLB00041&lt;/LEISTUNG&gt;&lt;LEITXT&gt;Partial Thromboplastin Time (PTT), Prothrombin Time (PT-INR)&lt;/LEITXT&gt;&lt;DIAGNOSIS/&gt;&lt;STATUS/&gt;&lt;STATUS_TXT/&gt;&lt;ZZRESULT_STATUS/&gt;&lt;ZZRESULT_STATUS_TEXT&gt;Completed with abnormal&lt;/ZZRESULT_STATUS_TEXT&gt;&lt;ZZN2DOC_KEY&gt;LAB000000000000001000230960401000&lt;/ZZN2DOC_KEY&gt;&lt;ZZLAB_RAD_CHECKED&gt;check_box_outline_blank@Click to set status &quot;Checked&quot;&lt;/ZZLAB_RAD_CHECKED&gt;&lt;ZZLAB_RAD_REPORT&gt;picture_as_pdf@Lab Report PDF&lt;/ZZLAB_RAD_REPORT&gt;&lt;ZZABNMRLPANICEXIST&gt;X&lt;/ZZABNMRLPANICEXIST&gt;&lt;ZZABNMRLPANICEXIST_LOGO&gt;circle icon_red@Abnrmal result exists.&lt;/ZZABNMRLPANICEXIST_LOGO&gt;&lt;/RN1WPV007_FIELDCAT&gt;&lt;/OUTPUT&gt;&lt;/asx:values&gt;&lt;/asx:abap&gt;</SOURCEDATA><FIELDNAME>ZZLAB_RAD_REPORT</FIELDNAME></OUTPUT></asx:values></asx:abap>',
      Actionid: 'ROWCLICK',
      Widgetid: 'MYLAB01',
      New: 'X',
      Fieldname: 'ZZLAB_RAD_REPORT',
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
    //this.confirmationMarkAsChecked(this.record);
  }

  confirmationMarkAsChecked(data) {
    this.checkedFlag = null;
    if ( data.Status == 'Not done' || data.Status == 'Completed') {
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

  markAsChecked(data) {
    this.getCheckPDF(data);
  }

  getCheckPDF(data) {
    let jsonObj = {
      Dockey: data.Dockey,
    };
    this.hospitalistService.getCheckPDF(jsonObj).subscribe(
      (_success: any) => {
        if (_success) {
          this.modalRef.hide();
          // this.reloadTableData.next('pdfTable');
        }
      },
      (_error: any) => {}
    );
  }

  getLabService(item: any, template: TemplateRef<any>) {
    const config: ModalOptions = {
      class: 'modal-dialog-centered modal-lg labservice-modal',
    };
    this.modalRef = this.modalService.show(template, config);
    this.laboratoryDetails = item;
    this.hospitalistService.getLabService(item.Vkgid).subscribe(
      (_success: any) => {
        let result = _success.d.results;
       item.orderDetailsCollspe = result.map((obj) => ({ ...obj, isSelected: false }));
       let reorderFlag = _.every(item.orderDetailsCollspe, ['ReorderFlag', false]);
       if(reorderFlag) item.reorderFlag = true;
       else item.reorderFlag = false;
      },
      (_error) => {}
    );
  }

  getDate(value) {
    if (value) {
      var str = value;
      var num = parseInt(str.replace(/[^0-9]/g, ''));
      var date = new Date(num);
      return date;
    }
  }

  
  openModuleLabChart(data) {
    window.open(
      environment.labChartUrl+'patnr=' +
        data.Patnr +
        '&falnr=' +
        data.Falnr +
        '&einri=' +
        data.Einri +
        '&lfdnr=' +
        data.Lfdnr +
        '&appl=LABCHART',
      '_blank'
    );
  }

  public openModalForPhyOrder(
    template: TemplateRef<any>,
    data: any,
    action: any
  ) {
    if (action == 'remove') {
      const config: ModalOptions = { class: 'modal-dialog-centered execute-delete-modal'};
      this.modalRef = this.modalService.show(template,config);
    }
    this.phyOrderData = data;
  }

  createLabData(item) {
    let selectOrderDetailsArray = item.orderDetailsCollspe.filter((element)=> {return element.isSelected}).map((node) => ({
      Leist: node.Leist,
      Haust: node.Haust,
      Vkgid: node.Vkgid,
    }));

    if(selectOrderDetailsArray.length < 1) {
      this.warningSwalModel("Please select at least one service to re-Order.")
      return;
    }

    let showTestMessage: any = '';
    let index = 0
    item.orderDetailsCollspe.filter((element)=> {
      if(element.isSelected) {
        index = index + 1
        if(showTestMessage) {
          showTestMessage = `${showTestMessage} <br> ${index}) ${element.Ktxt1}`
        } else {
          showTestMessage = `${index}) ${element.Ktxt1}`
        }
      }
    });
    
    // const lastIndex = showTestMessage.lastIndexOf(';');
    // showTestMessage = showTestMessage.slice(0, lastIndex) + '' + showTestMessage.slice(lastIndex + 1);
    Swal.fire({
      html: `<span style="font-weight: bold;">Are you sure you want to re-Order?</span><p style="text-align: start; margin-left: 18%;">${showTestMessage}</p>`,
      icon: 'warning',
      showCancelButton: true,
      customClass:"reorder-conform-modal",
      confirmButtonText: 'Yes',
      cancelButtonText: 'No',
    }).then((result) => {
      if (result.value) {
     
        let payloadObj = {
          Vkgid: item.Vkgid,
          ToLabServices: {
            results: selectOrderDetailsArray,
          },
        };
        this.hospitalistService.createLabPatientData(payloadObj).subscribe(
          (result: any) => {
            item.Active = false;
            this.successSwalModel("eOrder successful Created.");
          },
          (error) => {
            this.errorSwalModel('eOrder is not created. Please try again.')
          }
        );
      }
      this.checkedFlag = false;
    });
  }

  checkSelect(item) {
    var result = _.every(item.orderDetailsCollspe, ['isSelected', true]);
    if(result) item.masterSelected = true;
    else item.masterSelected = false;
  }

  selectAll(item) {
    for (var i = 0; i < item.orderDetailsCollspe.length; i++) {
      if(item.orderDetailsCollspe[i].ReorderFlag) {
        item.orderDetailsCollspe[i].isSelected = item.masterSelected;
      }
    }
  }

  warningSwalModel(warningMsg) {
    Swal.fire({
      title: warningMsg,
      icon: 'warning',
      confirmButtonText: 'OK',
      customClass:'swal-class'
    });
  }

  successSwalModel(successMsg: string) {
    Swal.fire({
      title: successMsg,
      icon: 'success',
      confirmButtonText: 'OK',
      customClass:'swal-class'
    });
  }

  errorSwalModel(successMsg: string) {
    Swal.fire({
      title: successMsg,
      icon: 'error',
      confirmButtonText: 'OK',
      customClass:'swal-class'
    });
  }

}
