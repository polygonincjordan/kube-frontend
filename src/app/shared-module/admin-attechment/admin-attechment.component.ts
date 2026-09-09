import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { EmergencyService } from '@services/emergency-dashboard/emergency-service';
import { BsModalRef, BsModalService, ModalOptions } from 'ngx-bootstrap/modal';


export interface CaseAttachmentResponse {
  d: {
    results: CaseAttachment[];
  };
}

export interface CaseAttachment {
  __metadata: {
    id: string;
    uri: string;
    type: string;
  };
  Einri: string;
  Attachment: string;
  Falnr: string;
  Patnr: string;
  Falar: string;
  Documenttype: string;
  Attachmenttype: string;
  Attachmentshortname: string;
  Attachmentdescription: string;
  Createdbyuser: string;
  Username: string;
  Createdon: string;
  Createdby: string;
}

@Component({
  selector: 'app-admin-attechment',
  templateUrl: './admin-attechment.component.html',
  styleUrls: ['./admin-attechment.component.scss']
})

export class AdminAttechmentComponent implements OnInit {
  @ViewChild('allergyModal', { static: true }) allergyModal: TemplateRef<any>;
  @ViewChild('releasepdfmodal') releasepdfmodal: TemplateRef<HTMLDivElement>;

  modalRefForAttechment: BsModalRef;
  modalRefForPDF: BsModalRef;
  selectedERList: any;
  attechmentList: CaseAttachment[] = [];
  constructor(private emergencyService: EmergencyService, private modalService: BsModalService, private sanitizer: DomSanitizer,) { }

  ngOnInit(): void {
  }

  public openModalForAttechment(data: any) {
    this.selectedERList = data;
    console.log(this.selectedERList, "this.selectedERList")
    const config: ModalOptions = {
      class: 'modal-dialog-centered modal-xl allergy-modal-size',
    };
    this.modalRefForAttechment = this.modalService.show(this.allergyModal, config);
    this.getAttechmentData(data?.Falnr);
  }

  getAttechmentData(Falnr) {
    this.emergencyService.adminAttechmentList(Falnr).subscribe((data: CaseAttachmentResponse) => {
      this.attechmentList = data?.d?.results;
    }, (error) => {
      console.error(error)
    })
  }

  pdfUrl: any = '';
  htmlData: SafeHtml = '';
  pdfUrlType: any = '';
  openSurgicalAssPdf(item) {
    this.pdfUrl = '';
    this.emergencyService
      .openAttechmentDoc(item)
      .subscribe((data: any) => {
        this.pdfUrlType = item.Attachmenttype;
        if (item.Attachmenttype == 'pdf') {
          this.pdfUrlConvertToBlob(data?.d?.Content);
        } else if (item.Attachmenttype == 'htm') {
           const decoded = atob(data?.d?.Content);
          this.htmlData = this.sanitizer.bypassSecurityTrustHtml(decoded);
          console.log(this.htmlData, "HTML");
          
        }
        const config: ModalOptions = {
          class: 'modal-dialog-centered modal-xl pdfmodal-size',
        };
        this.modalRefForPDF = this.modalService.show(this.releasepdfmodal, config);
      });
  }

  pdfUrlConvertToBlob(pdfValue) {
    let byteArray = new Uint8Array(atob(pdfValue).split("").map(char => char.charCodeAt(0)));
    let file = new Blob([byteArray], { type: "application/pdf" });
    this.pdfUrl = file;
    console.log(this.pdfUrl, "this.pdfUrl");
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
      var str = str.split(':');
      var finalstr = str[0] + ':' + str[1];
      return finalstr;
    }
  }
}
