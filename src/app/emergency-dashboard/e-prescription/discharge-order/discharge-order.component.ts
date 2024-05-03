import { Component, EventEmitter, OnDestroy, Output, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { EPrescriptionService } from '@services/e-Prescription/e-prescription.service';
import { Subscription } from 'rxjs';
import { MedicationPopupComponent } from './medication-popup/medication-popup.component';
import { TemplatePopupComponent } from './template-popup/template-popup.component';
import { TemplateDetailPopupComponent } from './template-detail-popup/template-detail-popup.component';
@Component({
  selector: 'discharge-order',
  templateUrl: './discharge-order.component.html',
  styleUrls: ['./discharge-order.component.scss']
})
export class DischargeOrderComponent implements OnDestroy {
  @ViewChild('medicationPopup', { static: true }) medicationPopup: MedicationPopupComponent;
  @ViewChild('templatePopup', { static: true }) templatePopup: TemplatePopupComponent;
  @ViewChild('templateDetailPopup') templateDetailPopup: TemplateDetailPopupComponent;
  @Output() createEvent = new EventEmitter<any>();
  @Output() onTemplateEvent = new EventEmitter<any>();
  private templateDetailSubscription: Subscription;
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
        if (data[i].Tmptype === "1") {
          this.ePrescriptionService.loadData(`e-prescription/OrderTemplateget?Einri=${this.ePrescriptionService.parameters.einri}&Falnr=${this.ePrescriptionService.parameters.falnr}&Tpgid=${data[i].Prscrid}&Ordtype=${'2'}`, false, false, false, false).subscribe((resp: any) => {
            if (resp.body && resp.body.d && resp.body.d.results) {
              templateList = templateList.concat(resp.body.d.results[0].TOORDERTEMPLATE.results);
              countComplete = countComplete + 1;
              if (countComplete === data.length) {
                this.ePrescriptionService.templatePopupSaveData = templateList;
              }
            }
          });
        } else if (data[i].Tmptype === "2") {
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

  broadCastEvent(event: any) {
    if (event.Tmptype === "1") {
      this.ePrescriptionService.loadData(`e-prescription/OrderTemplateget?Einri=${this.ePrescriptionService.parameters.einri}&Falnr=${this.ePrescriptionService.parameters.falnr}&Tpgid=${event.Prscrid}&Ordtype=${'2'}`, false, false, false, false).subscribe((resp: any) => {
        if (resp.body && resp.body.d && resp.body.d.results && resp.body.d.results[0].TOORDERTEMPLATE.results && resp.body.d.results[0].TOORDERTEMPLATE.results.length) {
          this.ePrescriptionService.templatePopupSaveData = resp.body.d.results[0].TOORDERTEMPLATE.results;
          // const templateList = resp.body.d.results[0].TOORDERTEMPLATE.results;
          // this.templateDetailPopup.showPopup(templateList);
        }
      });
    } else if (event.Tmptype === "2") {
      this.ePrescriptionService.loadData(`e-prescription/userTemplateMedication?EINRI=${this.ePrescriptionService.parameters.einri}&FALNR=${this.ePrescriptionService.parameters.falnr}&PRSCRID=${event.Prscrid}&Ordtype=${'2'}`, false, false, false, false).subscribe((resp: any) => {
        if (resp.body && resp.body.d && resp.body.d.results && resp.body.d.results[0].PrescriptionItemSet.results && resp.body.d.results[0].PrescriptionItemSet.results.length) {
          this.ePrescriptionService.templatePopupSaveData = resp.body.d.results[0].PrescriptionItemSet.results;
          const templateList = resp.body.d.results[0].PrescriptionItemSet.results;
          // this.templateDetailPopup.showPopup(templateList);
        }
      });
    }
    if (this.templateDetailSubscription) { this.templateDetailSubscription.unsubscribe(); };
    this.templateDetailSubscription = this.templateDetailPopup.onClose.subscribe(data => {
      this.ePrescriptionService.templatePopupSaveData = data
    });
  }

  ngOnDestroy(): void {
    if (this.templateSubscription) { this.templateSubscription.unsubscribe(); }
    if (this.medicationSubscription) { this.medicationSubscription.unsubscribe(); }
  }

  CreateDischargeOrder(){
    this.createEvent.emit();
  }
  TemplateDischargeOrder(){
    this.onTemplateEvent.emit();
  }
}
