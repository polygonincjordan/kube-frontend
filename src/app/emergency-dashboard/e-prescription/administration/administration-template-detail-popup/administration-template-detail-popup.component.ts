import { Component, EventEmitter, OnInit, Output, TemplateRef, ViewChild } from '@angular/core';
import { EPrescriptionService, TemplateMedDataList, TemplateMedDataListget } from '@services/e-Prescription/e-prescription.service';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import Swal from 'sweetalert2';
import { CycleDefinitionPopupComponent } from '../../../../shared-module/cycle-definition/cycle-definition-popup.component';

@Component({
  selector: 'administration-template-detail-popup',
  templateUrl: './administration-template-detail-popup.component.html',
  styleUrls: ['./administration-template-detail-popup.component.scss']
})
export class AdministrationTemplateDetailPopupComponent implements OnInit {

 ngOnInit(): void {
  }
  modaldetailRef: BsModalRef;
  isallSelected: boolean = false;
  @ViewChild('templatedetailPopup', { static: true }) templatedetailPopup: TemplateRef<any>;
  @ViewChild('cyclePopup', { static: true }) cyclePopup: CycleDefinitionPopupComponent;
  @Output() onClose: EventEmitter<any> = new EventEmitter<any>();

  public configurationData: TemplateMedDataListget[];

  constructor(public ePrescriptionService: EPrescriptionService, private modalService: BsModalService) { }

  showPopup(data: TemplateMedDataListget[]): void {
    if (data && data.length) {
      this.configurationData = data
      this.modaldetailRef = this.modalService.show(this.templatedetailPopup, { backdrop: true, ignoreBackdropClick: false, class: 'tempate-detail-popup' });
      for (let i = 0; i < this.configurationData.length; i++) {
        this.isallSelected = false;
        this.configurationData[i].isSelected = false;
      }
    }
  }

  /** View the cycle definition for a template row (read-only). Reads the order
   *  cycle first (OrdCycleDefSet by Meordid); falls back to the master cycle by
   *  frequency key (N1znr) when the order has none. */
  onOpenCycleDefinition(element: any): void {
    const n1znr = element && (element.N1znr || element.N1ZNR);
    const meordid = element && (element.Meordid || element.MEORDID);
    if (!n1znr && !meordid) { return; }
    const title = element.Result_Drug_Name || element.RESULT_DRUG_NAME || element.N1ztxt || element.N1ZTXT || '';
    if (meordid) {
      this.ePrescriptionService.loadData(`e-prescription/OrdCycleDefSet?Meordid=${meordid}`, false, false, false, false).subscribe((res: any) => {
        const records = res && res.body && res.body.d && res.body.d.results ? res.body.d.results : [];
        if (records.length) { this.showCycleDefinition(records, n1znr, title); return; }
        this.loadMasterCycleDefinition(n1znr, title);
      }, () => this.loadMasterCycleDefinition(n1znr, title));
      return;
    }
    this.loadMasterCycleDefinition(n1znr, title);
  }

  /** Read the master cycle definition by frequency key (N1znr). */
  private loadMasterCycleDefinition(n1znr: string, title: string): void {
    if (!n1znr) { this.showNoCycleDefinitionToast(); return; }
    this.ePrescriptionService.loadData(`e-prescription/CycleDefMasterSet?N1znr=${n1znr}`, false, false, false, false).subscribe((res: any) => {
      const records = res && res.body && res.body.d && res.body.d.results ? res.body.d.results : [];
      if (!records.length) { this.showNoCycleDefinitionToast(); return; }
      this.showCycleDefinition(records, n1znr, title);
    }, () => this.showNoCycleDefinitionToast());
  }

  private showCycleDefinition(records: any[], n1znr: string, title: string): void {
    this.cyclePopup.showPopup({ index: 0, n1znr, title, startDate: null, records, readOnly: true });
  }

  private showNoCycleDefinitionToast(): void {
    Swal.fire({
      toast: true,
      position: 'top-end',
      timer: 3000,
      showConfirmButton: false,
      text: 'No cycle definition available for this frequency',
      icon: 'info',
      customClass: { popup: 'myalertpopup' }
    } as any);
  }

  onCheckallMedicationData(event) {
    for (let i = 0; i < this.configurationData.length; i++) {
      this.configurationData[i].isSelected = event.target.checked;
    }
  }
  onisSelected() {
    if(this.configurationData && this.configurationData.length){
      const isSelect = this.configurationData.find(e => e.isSelected === false);
      isSelect ? this.isallSelected = false : this.isallSelected = true;
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
