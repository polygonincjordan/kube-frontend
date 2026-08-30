import { Component, EventEmitter, Output, TemplateRef, ViewChild } from '@angular/core';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';

@Component({
  selector: 'addition-info-popup',
  templateUrl: './addition-info-popup.component.html',
  styleUrls: ['./addition-info-popup.component.scss']
})
export class AdditionInfoPopupComponent{

  private modalRef: BsModalRef;
  public indexofData: number;
  public isDefaultComment: string;

  constructor(private modalService: BsModalService){}

  @ViewChild('additionalInfo', { static: true }) additionalInfo: TemplateRef<any>;

  @Output() onUpdateData: EventEmitter<any> = new EventEmitter;

  showPopup(data: any, index: any){
    this.isDefaultComment = data;
    this.indexofData = index
    this.modalRef = this.modalService.show(this.additionalInfo, { backdrop: true, ignoreBackdropClick: false, class: 'additional-info-temp' });
  }

  updateAdditionalInfo(event){
    this.onUpdateData.emit({data: event, index: this.indexofData})
    this.modalRef.hide();
  }

  cancelAdditionalInfo(){
    this.modalRef.hide();
  }
}
