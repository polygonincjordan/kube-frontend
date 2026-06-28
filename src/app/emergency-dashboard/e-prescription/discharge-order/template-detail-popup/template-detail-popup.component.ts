import { Component, EventEmitter, Output, TemplateRef, ViewChild } from '@angular/core';
import { EPrescriptionService, TemplateMedDataList, TemplateMedDataListget } from '@services/e-Prescription/e-prescription.service';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import Swal from 'sweetalert2';
import { CycleDefinitionPopupComponent } from '../../../../shared-module/cycle-definition/cycle-definition-popup.component';

@Component({
  selector: 'template-detail-popup',
  templateUrl: './template-detail-popup.component.html',
  styleUrls: ['./template-detail-popup.component.scss']
})
export class TemplateDetailPopupComponent {
  modaldetailRef: BsModalRef;
  isallSelected: boolean = false;
  @ViewChild('templatedetailPopup', { static: true }) templatedetailPopup: TemplateRef<any>;
  @ViewChild('cyclePopup', { static: true }) cyclePopup: CycleDefinitionPopupComponent;
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

  /** View the cycle definition for a template row (read-only). Cycle comes from the
   *  master by frequency key (N1znr); shows a notice if none is defined. */
  onOpenCycleDefinition(element: any): void {
    const n1znr = element.N1znr || element.N1ZNR;
    if (!n1znr) { return; }
    this.ePrescriptionService.loadData(`e-prescription/CycleDefMasterSet?N1znr=${n1znr}`, false, false, false, false).subscribe((res: any) => {
      const records = res && res.body && res.body.d && res.body.d.results ? res.body.d.results : [];
      if (!records.length) {
        Swal.fire({
          text: 'No cycle definition available for this frequency', icon: 'info',
          confirmButtonColor: '#0890c5', confirmButtonText: 'OK', customClass: { popup: 'myalertpopup' }
        } as any);
        return;
      }
      this.cyclePopup.showPopup({
        index: 0,
        n1znr,
        title: element.Result_Drug_Name || element.RESULT_DRUG_NAME || element.N1ztxt || element.N1ZTXT || '',
        startDate: null,
        records,
        readOnly: true
      });
    });
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
