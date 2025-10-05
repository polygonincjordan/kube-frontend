import { Component, EventEmitter, OnDestroy, Output, TemplateRef, ViewChild } from '@angular/core';
import { EPrescriptionService, TemplateMedicationData } from '@services/e-Prescription/e-prescription.service';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { Subscription } from 'rxjs';
import Swal from 'sweetalert2';
import { TemplateDetailPopupComponent } from '../template-detail-popup/template-detail-popup.component';

@Component({
  selector: 'template-popup',
  templateUrl: './template-popup.component.html',
  styleUrls: ['./template-popup.component.scss']
})
export class TemplatePopupComponent implements OnDestroy {
  private modalRef: BsModalRef;
  public templateDetailSubscription: Subscription;

  @ViewChild('templatePopup', { static: true }) templatePopup: TemplateRef<any>;
  @ViewChild('templateDetailPopup', { static: true }) templateDetailPopup: TemplateDetailPopupComponent;

  @Output() onClose: EventEmitter<any> = new EventEmitter<any>();

  public configurationData: TemplateMedicationData[];

  constructor(private modalService: BsModalService, private ePrescriptionService: EPrescriptionService) { }

  showPopup(data: TemplateMedicationData[]): void {
    this.configurationData = [];
    if (data && data.length) {
      this.configurationData = JSON.parse(JSON.stringify(data));
      this.modalRef = this.modalService.show(this.templatePopup, { backdrop: true, ignoreBackdropClick: false, class: 'template-med' });
    } else {
      Swal.fire({
        text: 'No template available for this patient',
        confirmButtonColor: '#0890c5',
        cancelButtonColor: '#84898c',
        confirmButtonText: 'OK',
        // customClass: 'myalertpopup',
        icon: 'error',
      });
    }
  }

  setSelectedTemplate() {
    this.onClose.emit(this.configurationData.filter(d => d.isSelected));
    this.modalRef.hide();
  }

  onTemplateLevelUpdate(updateData: any) {
    if (updateData) {
      this.ePrescriptionService.updateData(`UserTemplateSet(prscrid='${updateData.Prscrid}')`, updateData).subscribe(
        {
          next: (success: any) => {
          },
          error: (error: any) => {
          }
        }
      );
    }
  }
  onOpenTemplateDetail(data){
    this.modalRef.hide();
    if(data){
      let templateList = [];
      if(data.Tmptype === "1"){
        this.ePrescriptionService.loadData(`e-prescription/orderTemplateMedication?EINRI=${this.ePrescriptionService.parameters.einri}&FALNR=${this.ePrescriptionService.parameters.falnr}&PRSCRID=${data.Prscrid}&Ordtype=${'2'}`, false, false, false, false).subscribe((resp: any) => {
          if (resp.body && resp.body.d && resp.body.d.results) {
            templateList = resp.body.d.results[0].PrescriptionItemSet.results
          }
          this.templateDetailPopup.showPopup(templateList);
        });
      }else if(data.Tmptype === "2"){
        this.ePrescriptionService.loadData(`e-prescription/userTemplateMedication?EINRI=${this.ePrescriptionService.parameters.einri}&FALNR=${this.ePrescriptionService.parameters.falnr}&PRSCRID=${data.Prscrid}&Ordtype=${'2'}`, false, false, false, false).subscribe((resp: any) => {
          if (resp.body && resp.body.d && resp.body.d.results) {
            templateList = resp.body.d.results[0].PrescriptionItemSet.results
          }
          this.templateDetailPopup.showPopup(templateList);
        });
      }
    }
    this.templateDetailSubscription = this.templateDetailPopup.onClose.subscribe(data => {
      this.ePrescriptionService.templatePopupSaveData = data
    });
  }

  ngOnDestroy(): void {
    if (this.templateDetailSubscription) { this.templateDetailSubscription.unsubscribe(); }
  }
}
