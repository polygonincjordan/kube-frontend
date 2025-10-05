import { Component, EventEmitter, Output, TemplateRef, ViewChild } from '@angular/core';
import { DiagnosesData, SurgeryTeamData } from '@services/e-kardex/interfaces/inpatient-data';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import Swal from 'sweetalert2';

@Component({
  selector: 'config-popup',
  templateUrl: './config-popup.component.html',
  styleUrls: ['./config-popup.component.scss']
})
export class ConfigPopup {
  modalRef: BsModalRef;
  @ViewChild('inPatientPopup', { static: true }) inPatientPopup: TemplateRef<any>;
  @Output() onClose: EventEmitter<any> = new EventEmitter<any>();


  public config: ColumnMapping[] = [];
  public configurationData: any[] = [];

  constructor(private modalService: BsModalService) { }

  showPopup(columnConfig: ColumnMapping[], data: SurgeryTeamData[] | DiagnosesData[], designClass: any): void {
    this.configurationData = [];
    this.config = [];
    if (data && data.length && columnConfig && columnConfig.length) {
      this.config = columnConfig;
      this.configurationData = data;
      this.modalRef = this.modalService.show(this.inPatientPopup, { backdrop: true, ignoreBackdropClick: false, class: designClass });
    }else {
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

  setSelectedMedication() {
    this.onClose.emit(this.configurationData.filter(d => d.isSelected));
    this.modalRef.hide();
  }
}

export class ColumnMapping {
  columnTitle: string;
  fieldName: string;
  class: string;
  disabled: boolean;
}
