import { Component, EventEmitter, Output, Renderer2, TemplateRef, ViewChild } from '@angular/core';
import { EPrescriptionService } from '@services/e-Prescription/e-prescription.service';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import swal from 'sweetalert2';

@Component({
  selector: 'template-description',
  templateUrl: './template-description.component.html',
  styleUrls: ['./template-description.component.scss']
})
export class TemplateDescriptionComponent {
  private modalRef: BsModalRef;
  public templateName: string = "";
  public templateDescription: string = "";

  @ViewChild('templatePopup', { static: true }) templatePopup: TemplateRef<any>;

  @Output() onClose: EventEmitter<any> = new EventEmitter<any>();

  constructor(private modalService: BsModalService, public ePrescriptionService: EPrescriptionService, private renderer: Renderer2) { }

  showPopup() {
    this.templateName = ''
    this.modalRef = this.modalService.show(this.templatePopup, { backdrop: true, ignoreBackdropClick: false, class: 'template-med' })
    this.openPopup()
  }

  openPopup() {
    const inputElement = document.querySelector('.popup input');
    if (inputElement) {
      this.renderer.selectRootElement(inputElement).focus();
    }
  }

  savePopup() {
    if (!this.templateName || !this.templateName.trim()) {
      swal.fire({
        text: 'Please enter a template name.',
        confirmButtonColor: '#0890c5',
        confirmButtonText: 'OK',
        customClass: { popup: 'myalertpopup' },
        icon: 'error'
      } as any);
      return; // keep the popup open
    }
    this.onClose.emit({ Name: this.templateName.trim(), Desc: this.templateDescription });
    this.modalRef.hide();
  }

  closePopup() {
    this.modalRef.hide();
  }
}
