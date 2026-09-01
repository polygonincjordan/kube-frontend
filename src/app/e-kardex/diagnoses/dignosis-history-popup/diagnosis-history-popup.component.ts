import { DatePipe } from '@angular/common';
import { Component, EventEmitter, Output, TemplateRef, ViewChild } from '@angular/core';
import { mergeReleasedDocumentVersions } from '@services/document-version-history.util';
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
  @Output() onReleseCloseInPatient: EventEmitter<any> = new EventEmitter<any>();
  @Output() onAttachmentClose: EventEmitter<any> = new EventEmitter<any>();
  @Output() onCorrespondeClose: EventEmitter<any> = new EventEmitter<any>();
  @Output() onInPatientAttachmentClose: EventEmitter<any> = new EventEmitter<any>();

  public configurationData: any;

  constructor(private modalService: BsModalService) { }

  showPopup(data, currentDocument?): void {
    this.configurationData = mergeReleasedDocumentVersions(data, currentDocument);
    if (this.configurationData.length) {
      this.modalRef = this.modalService.show(this.releaseHistory, { backdrop: true, ignoreBackdropClick: false, class: 'release-history' });
    } else {
      Swal.fire({
        text: 'No Data Found',
        confirmButtonColor: '#0890c5',
        cancelButtonColor: '#84898c',
        confirmButtonText: 'OK',
        customClass: { popup: 'myalertpopup' },
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
    const selectedValue = value.sourceDocument || value;
    const event = {
      value: selectedValue,
      Oldversion: !value.isCurrentVersion,
      isCurrentVersion: !!value.isCurrentVersion,
    };
    if(selectedValue.Dtid === "ZMED_OPERT" || selectedValue.Dtid === "ZMED_ORRPT" || selectedValue.Dtid === "ZMED_PHDIS"){
      this.onReleseCloseInPatient.emit(event)
    }else {
      this.onReleseClose.emit(event);
    }
    this.modalRef.hide();
  }

  onOpenAttachmentInpatient(value: any) {
    if(value.Dtid === "ZMED_OPERT" || value.Dtid === "ZMED_ORRPT" || value.Dtid === "ZMED_PHDIS"){
      this.onInPatientAttachmentClose.emit(value.DocKey)
    } else if(value.Dtid === "ZMED_CORES") {
      this.onCorrespondeClose.emit(value.DocKey);
    }else {
      this.onAttachmentClose.emit(value.DocKey);
    }
    this.modalRef.hide();
  }

  formatDate(date: string) {
    if (date) {
      const newFormateDate = date.replace('/Date(', '').replace(')/', '')
      return new DatePipe('en-US').transform(newFormateDate, 'dd.MM.yyyy');
    }
  }
}
