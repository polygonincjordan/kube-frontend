import { Component, EventEmitter, OnDestroy, Output, Renderer2, TemplateRef, ViewChild } from '@angular/core';
import { EPrescriptionService, TemplateMedicationData } from '@services/e-Prescription/e-prescription.service';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { Subscription } from 'rxjs';
import Swal from 'sweetalert2';
import { TemplateDetailPopupComponent } from '../template-detail-popup/template-detail-popup.component';
import { TemplateEditPopupComponent } from '../template-edit-popup/template-edit-popup.component';

@Component({
  selector: 'template-popup',
  templateUrl: './template-popup.component.html',
  styleUrls: ['./template-popup.component.scss']
})
export class TemplatePopupComponent implements OnDestroy {
  private modalRef: BsModalRef;
  public templateDetailSubscription: Subscription;
  sortColumn: string = 'Descr';
  sortOrder: string = 'asc';
  sortDir = 1;
  sortable = true;
  public templateSearchQuery: string = '';
  @ViewChild('templatePopup', { static: true }) templatePopup: TemplateRef<any>;
  @ViewChild('templateDetailPopup', { static: true }) templateDetailPopup: TemplateDetailPopupComponent;
  @ViewChild('templateEditPopup', { static: true }) templateEditPopup: TemplateEditPopupComponent;

  @Output() onClose: EventEmitter<any> = new EventEmitter<any>();

  // Edit/Delete hidden until backend OrderTemplateSet update/delete is ready. Set true to re-enable.
  public templateEditDeleteEnabled = true;

  public configurationData: TemplateMedicationData[];

  constructor(private modalService: BsModalService, private ePrescriptionService: EPrescriptionService, private renderer: Renderer2) { }

  showPopup(data: TemplateMedicationData[]): void {
    this.configurationData = [];
    this.templateSearchQuery = '';
    if (data && data.length) {
      this.configurationData = this.sortTemplatesByLevel(JSON.parse(JSON.stringify(data)));
      this.modalRef = this.modalService.show(this.templatePopup, { backdrop: true, ignoreBackdropClick: false, class: 'template-med template-med-data' });
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
    this.openPopup()
  }
  openPopup() {
    const inputElement = document.querySelector('.popup input');
    if (inputElement) {
      this.renderer.selectRootElement(inputElement).focus();
    }
  }

  setSelectedTemplate() {
    this.onClose.emit(this.configurationData.filter(d => d.isSelected).map(d => d.Prscrid));
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
  SortData(col: string): void {
    if (this.sortColumn == col) {
      if (this.sortOrder == 'asc')
        this.sortOrder = 'desc';
      else
        this.sortOrder = 'asc';
    }
    else {
      this.sortColumn = col;
      this.sortOrder = 'asc';
    }
    this.configurationData = this.configurationData.sort((a, b) => {
      if (a[col] < b[col])
        return this.sortOrder == 'asc' ? -1 : 1;
      if (a[col] > b[col])
        return this.sortOrder == 'asc' ? 1 : -1;
      return 0;
    })
  }

  onSortClick(event, col: string) {
    let target = event.currentTarget,
      classList = target.classList;
    if (classList.contains('fa-chevron-up') && this.sortable) {
      classList.remove('fa-chevron-up');
      classList.add('fa-chevron-down');
      this.sortDir = -1;
    } else if (classList.contains('fa-chevron-down') && this.sortable) {
      classList.add('fa-chevron-up');
      classList.remove('fa-chevron-down');
      this.sortDir = 1;
    } else {
      classList.remove('fa-chevron-down');
      classList.remove('fa-chevron-up');
    }
    this.SortData(col);
  }

  private sortTemplatesByLevel(data: TemplateMedicationData[]): TemplateMedicationData[] {
    return data.sort((a, b) => {
      const levelA = a.Tmpaccesslevel === 'G' ? 1 : 0;
      const levelB = b.Tmpaccesslevel === 'G' ? 1 : 0;
      if (levelA !== levelB) {
        return levelA - levelB;
      }
      return (a.Descr || '').localeCompare(b.Descr || '');
    });
  }

  // onOpenTemplateDetail(data){
  //   this.modalRef.hide();
  //   if(data){
  //     let templateList = [];
  //     const filters = { 'EINRI': this.ePrescriptionService.parameters.einri, 'PRSCRID': data};
  //     this.ePrescriptionService.loadData('PrescriptionSet', filters, ['PrescriptionItemSet'], true, true).subscribe((resp: any) => {
  //       if (resp.body && resp.body.d && resp.body.d.results) {
  //         templateList = resp.body.d.results[0].PrescriptionItemSet.results
  //       }
  //       this.templateDetailPopup.showPopup(templateList);
  //     });
  //   }
  //   this.templateDetailSubscription = this.templateDetailPopup.onClose.subscribe(data => {
  //     this.ePrescriptionService.templatePopupSaveData = data
  //   });
  // }
  onOpenTemplateDetail(data) {
    this.modalRef.hide();
    if (data) {
      let templateList = [];
      if (data.Tmptype === "1") {
        this.ePrescriptionService.loadData(`e-prescription/OrderTemplateget?Einri=${this.ePrescriptionService.parameters.einri}&Falnr=${this.ePrescriptionService.parameters.falnr}&Tpgid=${data.Prscrid}&Ordtype=${'2'}`, false, false, false, false).subscribe((resp: any) => {
          if (resp.body && resp.body.d && resp.body.d.results) {
            templateList = resp.body.d.results[0].TOORDERTEMPLATE.results
          }
          this.templateDetailPopup.showPopup(templateList);
        });
      } else if (data.Tmptype === "2") {
        this.ePrescriptionService.loadData(`e-prescription/userTemplateMedication?EINRI=${this.ePrescriptionService.parameters.einri}&FALNR=${this.ePrescriptionService.parameters.falnr}&PRSCRID=${data.Prscrid}&Ordtype=${'2'}`, false, false, false, false).subscribe((resp: any) => {
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
    const meta = { prscrid: data.Prscrid, templateName: data.Descr, templateDesc: data.Descr, ordtype: '2' };
    this.ePrescriptionService.loadData(`e-prescription/OrderTemplateget?Einri=${this.ePrescriptionService.parameters.einri}&Falnr=${this.ePrescriptionService.parameters.falnr}&Tpgid=${data.Prscrid}&Ordtype=${'2'}`, false, false, false, false).subscribe((resp: any) => {
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
          this.ePrescriptionService.loadTemplateMedicationData();
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
