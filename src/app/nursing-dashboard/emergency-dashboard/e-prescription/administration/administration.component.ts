import { Component, OnInit, ViewChild } from '@angular/core';
import { EPrescriptionService } from '@services/e-Prescription/e-prescription.service';
import { Subscription } from 'rxjs';
import { AdministrationTemplatePopupComponent } from './administration-template-popup/administration-template-popup.component';


@Component({
  selector: 'administration',
  templateUrl: './administration.component.html',
  styleUrls: ['./administration.component.scss']
})
export class AdministrationComponent implements OnInit {
  public orderType: any[];
  @ViewChild('templatePopup', { static: true }) templatePopup: AdministrationTemplatePopupComponent;
  private templateSubscription: Subscription;
  selectedAccount = 'Standard Order';
  constructor(public ePrescriptionService: EPrescriptionService) { }
  ngOnInit(): void {
    this.orderType = [
      { Desc: 'Standard Order', Val: 'Standard Order' },
      { Desc: 'Infusion Intermittent', Val: 'Infusion Intermittent' },
      { Desc: 'Infusion Continuous', Val: 'Infusion Continuous' },
      { Desc: 'Chemotherapy', Val: 'Chemotherapy' },
      { Desc: 'Anesthesia', Val: 'Anesthesia' }
    ]
  }

  onOpenTemplatePopup() {
    this.templatePopup.showPopup(this.ePrescriptionService.administrationTemplateData);
    if (this.templateSubscription) { this.templateSubscription.unsubscribe(); }
    this.templateSubscription = this.templatePopup.onClose.subscribe(data => {
      let templateList = [];
      let countComplete = 0;
      for (let i = 0; i < data.length; i++) {
        if(data[i].Tmptype === "1"){
        this.ePrescriptionService.loadData(`e-prescription/orderTemplateMedication?EINRI=${this.ePrescriptionService.parameters.einri}&FALNR=${this.ePrescriptionService.parameters.falnr}&PRSCRID=${data[i].Prscrid}&Ordtype=${'1'}`, false, false, false, false).subscribe((resp: any) => {
          if (resp.body && resp.body.d && resp.body.d.results) {
            templateList = templateList.concat(resp.body.d.results[0].PrescriptionItemSet.results);
            countComplete = countComplete + 1;
            if (countComplete === data.length) {
              this.ePrescriptionService.templatePopupSaveData = templateList;
            }
          }
        });
      }else if(data[i].Tmptype === "2"){
        this.ePrescriptionService.loadData(`e-prescription/userTemplateMedication?EINRI=${this.ePrescriptionService.parameters.einri}&FALNR=${this.ePrescriptionService.parameters.falnr}&PRSCRID=${data[i].Prscrid}&Ordtype=${'1'}`, false, false, false, false).subscribe((resp: any) => {
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

  ngOnDestroy(): void {
    if (this.templateSubscription) { this.templateSubscription.unsubscribe(); }
  }
}
