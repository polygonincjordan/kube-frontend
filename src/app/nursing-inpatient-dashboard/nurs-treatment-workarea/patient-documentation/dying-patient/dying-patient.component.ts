import { Component, OnInit, TemplateRef } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';

@Component({
  selector: 'app-dying-patient',
  templateUrl: './dying-patient.component.html',
  styleUrls: ['./dying-patient.component.scss']
})
export class DyingPatientComponent implements OnInit {
   userGroup: FormGroup;
  modalRef?: BsModalRef;
  yesNoOptions = [
    { value: '0', label: 'Yes' },
    { value: '1', label: 'No' },
  ];
  public CurrentDateAndTime: Date = new Date();
  currentTime: string;
  constructor(public modalService: BsModalService) {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    this.currentTime = `${hours}:${minutes}:${seconds}`;
   }

  ngOnInit(): void {
  }

   updateAdditionalInfo() {}
  
    cancelAdditionalInfo() {
      this.modalRef.hide();
    }

  showPopup(template: TemplateRef<any>) {
      this.modalRef = this.modalService.show(template, {
        backdrop: true,
        ignoreBackdropClick: false,
        class: 'additional-info-temp',
      });
    }

}
