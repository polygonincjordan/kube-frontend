import { Component, EventEmitter, Output, TemplateRef, ViewChild } from '@angular/core';
import { EPrescriptionService, PatientMedicationData } from '@services/e-Prescription/e-prescription.service';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import Swal from 'sweetalert2';

@Component({
  selector: 'medication-popup',
  templateUrl: './medication-popup.component.html',
  styleUrls: ['./medication-popup.component.scss']
})

export class MedicationPopupComponent {
  modalRef: BsModalRef;
  @ViewChild('medicationPopup', { static: true }) medicationPopup: TemplateRef<any>;
  @Output() onClose: EventEmitter<any> = new EventEmitter<any>();

  public configurationData: PatientMedicationData[];

  constructor(public ePrescriptionService: EPrescriptionService, private modalService: BsModalService) { }

  showPopup(data: PatientMedicationData[]): void {
    this.configurationData = [];
    if (data && data.length) {
      this.configurationData = JSON.parse(JSON.stringify(data));
      this.modalRef = this.modalService.show(this.medicationPopup, { backdrop: true, ignoreBackdropClick: false, class: 'medication-template' });
    } else {
      Swal.fire({
        text: 'No medication available for this patient',
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

  setSelectedMedication() {
    this.onClose.emit(this.configurationData.filter(d => d.isSelected));
    this.modalRef.hide();
  }


  medicationMath(data: any) {
    return Math.floor(data)
  }
}
