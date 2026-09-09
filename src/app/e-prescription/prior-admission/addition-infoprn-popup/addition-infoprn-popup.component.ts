import { Component, EventEmitter, Input, OnInit, Output, TemplateRef, ViewChild } from '@angular/core';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';

@Component({
  selector: 'addition-infoprn-popup',
  templateUrl: './addition-infoprn-popup.component.html',
  styleUrls: ['./addition-infoprn-popup.component.scss']
})
export class AdditionInfoprnPopupComponent implements OnInit {

  private modalRef: BsModalRef;
  public indexofData: number;
  public isDefaultComment: string;

  constructor(private modalService: BsModalService) { }

  ngOnInit() { }
  @Input() editPrncond: any;

  @ViewChild('additionalInfoprn', { static: true }) additionalInfoprn: TemplateRef<any>;

  @Output() onUpdateprnData: EventEmitter<any> = new EventEmitter;

  showPopup(data: any, index: any) {
    // this.editPrncond.value.MedicationorderData[index].Prncond;
    this.isDefaultComment = data;
    this.indexofData = index
    this.modalRef = this.modalService.show(this.additionalInfoprn, { backdrop: true, ignoreBackdropClick: false, class: 'additional-info-temp' });
  }

  updateAdditionalInfo(event, index?) {
    // this.editPrncond.value.MedicationorderData[index];
    this.onUpdateprnData.emit({ data: event, index: this.indexofData })
    this.modalRef.hide();
  }

  cancelAdditionalInfo() {
    this.modalRef.hide();
  }
}
