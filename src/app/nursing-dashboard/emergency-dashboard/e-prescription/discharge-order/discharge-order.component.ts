import { Component, EventEmitter, OnDestroy, Output, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { EPrescriptionService } from '@services/e-Prescription/e-prescription.service';
import { Subscription } from 'rxjs';
import { MedicationPopupComponent } from './medication-popup/medication-popup.component';
import { TemplatePopupComponent } from './template-popup/template-popup.component';
@Component({
  selector: 'discharge-order',
  templateUrl: './discharge-order.component.html',
  styleUrls: ['./discharge-order.component.scss']
})
export class DischargeOrderComponent implements OnDestroy {
  @ViewChild('medicationPopup', { static: true }) medicationPopup: MedicationPopupComponent;
  @ViewChild('templatePopup', { static: true }) templatePopup: TemplatePopupComponent;
  @Output() createEvent = new EventEmitter<any>();
  private templateSubscription: Subscription;
  private medicationSubscription: Subscription;

  constructor(public ePrescriptionService: EPrescriptionService, private route: ActivatedRoute) { }

  onOpenMedicationPopup() {
    this.medicationPopup.showPopup(this.ePrescriptionService.patientMadication);
    if (this.medicationSubscription) { this.medicationSubscription.unsubscribe(); }
    this.medicationSubscription = this.medicationPopup.onClose.subscribe(data => {
      this.ePrescriptionService.medicationPopupSaveData = data;
    });
  }

  onOpenTemplatePopup() {
    this.templatePopup.showPopup(this.ePrescriptionService.templateMedicationData);
    if (this.templateSubscription) { this.templateSubscription.unsubscribe(); }
    this.templateSubscription = this.templatePopup.onClose.subscribe(data => {
      let templateList = [];
      let countComplete = 0;
      for (let i = 0; i < data.length; i++) {
        if(data[i].Tmptype ==="1"){
          this.ePrescriptionService.loadData(`e-prescription/orderTemplateMedication?EINRI=${this.ePrescriptionService.parameters.einri}&FALNR=${this.ePrescriptionService.parameters.falnr}&PRSCRID=${data[i].Prscrid}&Ordtype=${'2'}`, false, false, false, false).subscribe((resp: any) => {
            if (resp.body && resp.body.d && resp.body.d.results) {
              templateList = templateList.concat(resp.body.d.results[0].PrescriptionItemSet.results);
              countComplete = countComplete + 1;
              if (countComplete === data.length) {
                this.ePrescriptionService.templatePopupSaveData = templateList;
              }
            }
          });
        }else if(data[i].Tmptype === "2"){
          this.ePrescriptionService.loadData(`e-prescription/userTemplateMedication?EINRI=${this.ePrescriptionService.parameters.einri}&FALNR=${this.ePrescriptionService.parameters.falnr}&PRSCRID=${data[i].Prscrid}&Ordtype=${'2'}`, false, false, false, false).subscribe((resp: any) => {
            if (resp.body && resp.body.d && resp.body.d.results) {
              templateList = templateList.concat(resp.body.d.results[0].PrescriptionItemSet.results);
              countComplete = countComplete + 1;
              if (countComplete === data.length) {
                this.ePrescriptionService.templatePopupSaveData = templateList;
              }
            }
          });
        }
      }
    });
  }
  
  CreateDischargeOrder(){
    this.createEvent.emit();
  }
  ngOnDestroy(): void {
    if (this.templateSubscription) { this.templateSubscription.unsubscribe(); }
    if (this.medicationSubscription) { this.medicationSubscription.unsubscribe(); }
  }
}
