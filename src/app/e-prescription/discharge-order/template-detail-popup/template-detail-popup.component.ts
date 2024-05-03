import { Component, EventEmitter, Output, TemplateRef, ViewChild } from '@angular/core';
import { EPrescriptionService, TemplateMedDataList, TemplateMedDataListget } from '@services/e-Prescription/e-prescription.service';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';

@Component({
  selector: 'template-detail-popup',
  templateUrl: './template-detail-popup.component.html',
  styleUrls: ['./template-detail-popup.component.scss']
})
export class TemplateDetailPopupComponent {
  modaldetailRef: BsModalRef;
  isallSelected: boolean = false;
  @ViewChild('templatedetailPopup', { static: true }) templatedetailPopup: TemplateRef<any>;
  @Output() onClose: EventEmitter<any> = new EventEmitter<any>();

  public configurationData : any;

  constructor(public ePrescriptionService: EPrescriptionService, private modalService: BsModalService) { }

  showPopup(data): void {
    if (data && data.length) {
      this.configurationData = data
      this.modaldetailRef = this.modalService.show(this.templatedetailPopup, { backdrop: true, ignoreBackdropClick: false, class: 'tempate-detail-popup' });
      for (let i = 0; i < this.configurationData.length; i++) {
        this.isallSelected = false;
        this.configurationData[i].isSelected = false;
      }
    }
  }

  onisSelected() {
    if(this.configurationData && this.configurationData.length){
      const isSelect = this.configurationData.find(e => e.isSelected === false);
      isSelect ? this.isallSelected = false : this.isallSelected = true;
    }
  }

  onCheckallMedicationData(event) {
    for (let i = 0; i < this.configurationData.length; i++) {
      this.configurationData[i].isSelected = event.target.checked;
    }
  }

  setSelectedMedication() {
    this.onClose.emit(this.configurationData.filter(d => d.isSelected));
    this.modaldetailRef.hide();
  }
  medicationMath(data: any) {
    return Math.floor(data)
  }
}
