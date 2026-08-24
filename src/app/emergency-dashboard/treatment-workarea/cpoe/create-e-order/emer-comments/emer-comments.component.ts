import { Component, EventEmitter, OnInit, Output, TemplateRef, ViewChild } from '@angular/core';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';

@Component({
  selector: 'app-emer-comments',
  templateUrl: './emer-comments.component.html',
  styleUrls: ['./emer-comments.component.scss']
})
export class EmerCommentsComponent implements OnInit {


  ngOnInit(): void {
  }
  private modalRef: BsModalRef;
  public indexofData: number;
  public isDefaultComment: string;
  public configureData: any;

  constructor(private modalService: BsModalService) { }

  @ViewChild('additionalInfo', { static: true }) additionalInfo: TemplateRef<any>;

  @Output() onUpdateData: EventEmitter<any> = new EventEmitter;

  showPopup(data: any, index: any) {
    this.configureData = data
    this.isDefaultComment = data.note;
    this.indexofData = index
    this.modalRef = this.modalService.show(this.additionalInfo, { backdrop: true, ignoreBackdropClick: false, class: 'additional-info-temp' });
  }

  updateAdditionalInfo(event) {
    this.onUpdateData.emit({ note: event, data: this.configureData, index: this.indexofData })
    this.modalRef.hide();
  }

  cancelAdditionalInfo() {
    this.modalRef.hide();
  }
}
