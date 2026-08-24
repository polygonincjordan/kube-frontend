import { ChangeDetectorRef, Component, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { EPrescriptionService } from '@services/e-Prescription/e-prescription.service';
import { Subscription } from 'rxjs';
import { AdministrationTemplatePopupComponent } from './administration-template-popup/administration-template-popup.component';
import { Router } from '@angular/router';
import { ChemotherapyService } from '@services/chemotherapy.service';


@Component({
  selector: 'administration',
  templateUrl: './administration.component.html',
  styleUrls: ['./administration.component.scss']
})
export class AdministrationComponent implements OnInit {
  public orderType: any[];
  @ViewChild('templatePopup', { static: true }) templatePopup: AdministrationTemplatePopupComponent;
  @Output() isChemotherapy:EventEmitter<{isTrue:boolean}> =  new EventEmitter<{isTrue:boolean}>();
  private templateSubscription: Subscription;
  selectedAccount : string = 'Standard Order';
  constructor(public ePrescriptionService: EPrescriptionService,private cd: ChangeDetectorRef, public chemotherapyService: ChemotherapyService) { }
  ngOnInit(): void {
    this.orderType = [
      { Desc: 'Standard Order', Val: 'Standard Order' },
      { Desc: 'Infusion Intermittent', Val: 'Infusion Intermittent' },
      { Desc: 'Infusion Continuous', Val: 'Infusion Continuous' },
      { Desc: 'Chemotherapy', Val: 'Chemotherapy' },
      { Desc: 'Anesthesia', Val: 'Anesthesia' }
    ]
    this.onSelectChange()
  }

  onSelectChange() {
    this.isChemotherapy.emit({isTrue: this.selectedAccount === 'Chemotherapy'});
  }

  onOpenTemplatePopup() {
    this.templatePopup.showPopup(this.ePrescriptionService.administrationTemplateData);
    if (this.templateSubscription) { this.templateSubscription.unsubscribe(); }
    this.templateSubscription = this.templatePopup.onClose.subscribe(data => {
      this.ePrescriptionService.loadAdministrationTemplateRowsForTemplates(data).subscribe((templateList: any[]) => {
        this.ePrescriptionService.templatePopupSaveData = templateList;
      });
    });
  }

  ngOnDestroy(): void {
    if (this.templateSubscription) { this.templateSubscription.unsubscribe(); }
  }
}
