import { DatePipe } from '@angular/common';
import { Component, EventEmitter, Output, TemplateRef, ViewChild } from '@angular/core';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import Swal from 'sweetalert2';

@Component({
  selector: 'diagnosis-history-popup',
  templateUrl: './diagnosis-history-popup.component.html',
  styleUrls: ['./diagnosis-history-popup.component.scss']
})
export class DiagnosisHistoryPopupComponent {

  modalRef: BsModalRef;
  @ViewChild('releaseHistory', { static: true }) releaseHistory: TemplateRef<any>;
  @Output() onReleseClose: EventEmitter<any> = new EventEmitter<any>();
  @Output() onAttachmentClose: EventEmitter<any> = new EventEmitter<any>();

  public configurationData: any;

  constructor(private modalService: BsModalService) { }

  showPopup(data): void {
    this.configurationData = [];
    if (data && data.length) {
      this.configurationData = data;
      this.modalRef = this.modalService.show(this.releaseHistory, { backdrop: true, ignoreBackdropClick: false, class: 'release-history' });
    } else {
      Swal.fire({
        text: 'No Data Found',
        confirmButtonColor: '#0890c5',
        cancelButtonColor: '#84898c',
        confirmButtonText: 'OK',
        // customClass: 'myalertpopup',
        icon: 'error',
      });
    }
  }

  onCheckallMedicationData(event) {
    for (let i = 0; i < this.configurationData.length; i++) {
      this.configurationData[i].isSelected = event.target.checked;
    }
  }

  onOpenModelInpatient(value: any) {
    this.onReleseClose.emit({value: value, Oldversion: true});
    this.modalRef.hide();
  }

  onOpenAttachmentInpatient(value: any) {
    this.onAttachmentClose.emit(value);
    this.modalRef.hide();
  }

  formatDate(date: string) {
    if (date) {
      const newFormateDate = date.replace('/Date(', '').replace(')/', '')
      return new DatePipe('en-US').transform(newFormateDate, 'dd.MM.yyyy');
    }
  }

  dockVer(value) {
    return `(v${parseInt(value)})`
  }
}
