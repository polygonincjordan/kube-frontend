import { Component, EventEmitter, OnInit, Output, TemplateRef, ViewChild } from '@angular/core';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import Swal from 'sweetalert2';

@Component({
  selector: 'medications-popup',
  templateUrl: './medications-popup.component.html',
  styleUrls: ['./medications-popup.component.scss']
})
export class MedicationsPopupComponent implements OnInit {
  public isDefaultComment: string;
  private modalRef: BsModalRef;
  @ViewChild('medicationspopup', { static: true }) medicationspopup: TemplateRef<any>;
  @Output() Medicationsdata: EventEmitter<any> = new EventEmitter;

  configurationdata: any;
  constructor(private modalService: BsModalService) { }

  ngOnInit(): void {
  }
  showPopup(data: any) {
    if (data && data.length) {
      this.configurationdata = data;
      if (this.configurationdata && this.configurationdata.length) {
        this.modalRef = this.modalService.show(this.medicationspopup, { backdrop: true, ignoreBackdropClick: false, class: 'additional-info-temp' });
      }
    }
  }

  onMedicationsdata(data: any) {
    this.Medicationsdata.emit(data);
    this.modalRef.hide();
  }
}
