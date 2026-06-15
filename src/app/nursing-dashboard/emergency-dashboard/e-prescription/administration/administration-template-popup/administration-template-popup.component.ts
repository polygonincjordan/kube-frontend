import { Component, EventEmitter, OnInit, Output, TemplateRef, ViewChild } from '@angular/core';
import { AdministrationTemplateData, EPrescriptionService, TemplateMedicationData } from '@services/e-Prescription/e-prescription.service';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { Subscription } from 'rxjs';
import Swal from 'sweetalert2';
import { TemplateDetailPopupComponent } from '../../discharge-order/template-detail-popup/template-detail-popup.component';

@Component({
  selector: 'administration-template-popup',
  templateUrl: './administration-template-popup.component.html',
  styleUrls: ['./administration-template-popup.component.scss']
})
export class AdministrationTemplatePopupComponent implements OnInit {

  ngOnInit(): void {
  }
  private modalRef: BsModalRef;
  public templateDetailSubscription: Subscription;

  @ViewChild('templatePopup', { static: true }) templatePopup: TemplateRef<any>;
  @ViewChild('templateDetailPopup', { static: true }) templateDetailPopup: TemplateDetailPopupComponent;

  @Output() onClose: EventEmitter<any> = new EventEmitter<any>();

  public configurationData: AdministrationTemplateData[];

  constructor(private modalService: BsModalService, private ePrescriptionService: EPrescriptionService) { }

  showPopup(data: AdministrationTemplateData[]): void {
    this.configurationData = [];
    if (data && data.length) {
      this.configurationData = this.sortTemplatesByLevel(JSON.parse(JSON.stringify(data)));
      this.modalRef = this.modalService.show(this.templatePopup, { backdrop: true, ignoreBackdropClick: false, class: 'template-med' });
    } else {
      Swal.fire({
        text: 'No template available for this patient',
        confirmButtonColor: '#0890c5',
        cancelButtonColor: '#84898c',
        confirmButtonText: 'OK',
        customClass: { popup: 'myalertpopup' },
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

  private sortTemplatesByLevel(data: AdministrationTemplateData[]): AdministrationTemplateData[] {
    return data.sort((a, b) => {
      const levelA = a.Tmpaccesslevel === 'G' ? 1 : 0;
      const levelB = b.Tmpaccesslevel === 'G' ? 1 : 0;
      if (levelA !== levelB) {
        return levelA - levelB;
      }
      return (a.Descr || '').localeCompare(b.Descr || '');
    });
  }

  onOpenTemplateDetail(data) {
    this.modalRef.hide();
    if (data) {
      let templateList = [];
      if (data.Tmptype === "1") {
        this.ePrescriptionService.loadData(`e-prescription/orderTemplateMedication?EINRI=${this.ePrescriptionService.parameters.einri}&FALNR=${this.ePrescriptionService.parameters.falnr}&PRSCRID=${data.Prscrid}&Ordtype=${'1'}`, false, false, false, false).subscribe((resp: any) => {
          if (resp.body && resp.body.d && resp.body.d.results) {
            templateList = resp.body.d.results[0].PrescriptionItemSet.results
          }
          this.templateDetailPopup.showPopup(templateList);
        });
      } else if (data.Tmptype === "2") {
        this.ePrescriptionService.loadData(`e-prescription/userTemplateMedication?EINRI=${this.ePrescriptionService.parameters.einri}&FALNR=${this.ePrescriptionService.parameters.falnr}&PRSCRID=${data.Prscrid}&Ordtype=${'1'}`, false, false, false, false).subscribe((resp: any) => {
          if (resp.body && resp.body.d && resp.body.d.results) {
            templateList = resp.body.d.results[0].PrescriptionItemSet.results
          }
          this.templateDetailPopup.showPopup(templateList);
        });
      }
    }
    if (this.templateDetailSubscription) { this.templateDetailSubscription.unsubscribe(); }
    this.templateDetailSubscription = this.templateDetailPopup.onClose.subscribe(data => {
      this.ePrescriptionService.templatePopupSaveData = data
    });
  }

  ngOnDestroy(): void {
    if (this.templateDetailSubscription) { this.templateDetailSubscription.unsubscribe(); }
  }
}
