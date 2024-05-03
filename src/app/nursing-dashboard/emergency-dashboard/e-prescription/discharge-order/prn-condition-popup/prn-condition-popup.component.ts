import { Component, EventEmitter, OnInit, Output, TemplateRef, ViewChild } from '@angular/core';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';

@Component({
  selector: 'prn-condition-popup',
  templateUrl: './prn-condition-popup.component.html',
  styleUrls: ['./prn-condition-popup.component.scss']
})
export class PrnConditionPopupComponent{

  private modalRef: BsModalRef;
  public indexofData: number;
  public isDefaultCondition: string;

  constructor(private modalService: BsModalService){}

  @ViewChild('prnCondition', { static: true }) prnCondition: TemplateRef<any>;

  @Output() onUpdateData: EventEmitter<any> = new EventEmitter;

  showPopup(data: any, index: any){
    this.isDefaultCondition = data;
    this.indexofData = index
    this.modalRef = this.modalService.show(this.prnCondition, { backdrop: true, ignoreBackdropClick: true, class: 'additional-info-temp' });
  }

  updatePrnInfo(event){
    this.onUpdateData.emit({data: event, index: this.indexofData})
    this.modalRef.hide();
  }

  cancelPrnInfo(event){
    this.onUpdateData.emit({data: "", index: this.indexofData})
    this.modalRef.hide();
  }
}
