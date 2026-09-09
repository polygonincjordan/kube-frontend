import { Component, Input, TemplateRef } from '@angular/core';
import { eOrderService } from '@services/eorder.service';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';

@Component({
  selector: 'app-e-order-history',
  templateUrl: './e-order-history.component.html',
  styleUrls: ['./e-order-history.component.scss'],
})
export class EOrderHistoryComponent {
  @Input('orderHistory') orderHistory: any;
  selectedData: any;
  modalRef?: BsModalRef | null;
  constructor(public eorderService: eOrderService,public modalService: BsModalService) {}
  ngOnDestroy() {this.orderHistory = [];}
  openComments(template: TemplateRef<any>,data){
    this.modalRef = this.modalService.show(template, {
      id: 1,
      class: 'additional-info-temp modal-lg',
    });
    this.selectedData = data;
  }
}
