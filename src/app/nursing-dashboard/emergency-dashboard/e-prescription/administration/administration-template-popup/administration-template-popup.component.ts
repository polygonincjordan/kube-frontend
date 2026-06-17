import { Component, EventEmitter, OnInit, Output, TemplateRef, ViewChild } from '@angular/core';
import { AdministrationTemplateData, EPrescriptionService, TemplateMedicationData } from '@services/e-Prescription/e-prescription.service';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { Subscription } from 'rxjs';
import Swal from 'sweetalert2';
import { TemplateDetailPopupComponent } from '../../discharge-order/template-detail-popup/template-detail-popup.component';
import { AdministrationTemplateEditPopupComponent } from '../administration-template-edit-popup/administration-template-edit-popup.component';

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
  @ViewChild('templateEditPopup', { static: true }) templateEditPopup: AdministrationTemplateEditPopupComponent;

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

  /** Edit icon (user-level only): load the OrderTemplateSet rows (round-trip shape) then open the editable popup. */
  onEditTemplate(data) {
    if (!data) { return; }
    this.modalRef.hide();
    const meta = { prscrid: data.Prscrid, templateName: data.Descr, templateDesc: data.Descr, ordtype: '1' };
    this.ePrescriptionService.loadData(`e-prescription/OrderTemplateget?Einri=${this.ePrescriptionService.parameters.einri}&Falnr=${this.ePrescriptionService.parameters.falnr}&Tpgid=${data.Prscrid}&Ordtype=${'1'}`, false, false, false, false).subscribe((resp: any) => {
      const templateList = (resp.body && resp.body.d && resp.body.d.results) ? resp.body.d.results[0].TOORDERTEMPLATE.results : [];
      this.templateEditPopup.showPopup(templateList, meta);
    });
  }

  /** Delete icon (user-level only): soft-delete the template after confirmation. */
  onDeleteTemplate(data) {
    if (!data) { return; }
    Swal.fire({
      text: `Are you sure you want to delete the template "${data.Descr}"?`,
      showCancelButton: true,
      confirmButtonColor: '#0890c5',
      cancelButtonColor: '#84898c',
      confirmButtonText: 'Yes',
      cancelButtonText: 'No',
      customClass: { popup: 'myalertpopup' },
      icon: 'warning',
    } as any).then((result: any) => {
      if (!result.value) { return; }
      this.ePrescriptionService.deleteData(`OrderTemplateSet(Eorderid='${data.Prscrid}')`).subscribe({
        next: () => {
          this.configurationData = this.configurationData.filter(d => d.Prscrid !== data.Prscrid);
          this.ePrescriptionService.loadAdministrationTemplateData();
          Swal.fire({
            text: 'Template deleted successfully',
            confirmButtonColor: '#0890c5',
            cancelButtonColor: '#84898c',
            confirmButtonText: 'OK',
            customClass: { popup: 'myalertpopup' },
            icon: 'success',
          } as any);
        },
        error: (error: any) => {
          const message = error && error.error && error.error.error && error.error.error.message ? error.error.error.message.value : 'Unable to delete the template';
          Swal.fire({
            text: message,
            confirmButtonColor: '#0890c5',
            cancelButtonColor: '#84898c',
            confirmButtonText: 'OK',
            customClass: { popup: 'myalertpopup' },
            icon: 'error',
          } as any);
        }
      });
    });
  }

  ngOnDestroy(): void {
    if (this.templateDetailSubscription) { this.templateDetailSubscription.unsubscribe(); }
  }
}
