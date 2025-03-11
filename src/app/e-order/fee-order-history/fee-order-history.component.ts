import { DatePipe } from '@angular/common';
import { Component, Input, OnInit, TemplateRef } from '@angular/core';
import { CpoeService } from '@services/emergency-dashboard/cpoe.service';
import { eOrderService } from '@services/eorder.service';
import { FeeListService } from '@services/fee-service/fee-list.service';
import { BsModalRef, BsModalService, ModalOptions } from 'ngx-bootstrap/modal';

@Component({
  selector: 'app-fee-order-history',
  templateUrl: './fee-order-history.component.html',
  styleUrls: ['./fee-order-history.component.scss'],
})
export class FeeOrderHistoryComponent implements OnInit {
  @Input('orderHistory') orderHistory: any;

  modalRef: BsModalRef;

  constructor(public eorderService: eOrderService, public feeListService: FeeListService,
    private datePipe: DatePipe, private modalService: BsModalService) { }

  ngOnInit(): void {


  }

  getStatusValue(item: any) {
    if (item == "") {
      return "Released";
    } else if (item == "X") {
      return "Planned";
    } else {
      return "";
    }
  }

  getDate(item) {
    let dateParts = item.split('-');
    let dateObject = new Date(Number(dateParts[0]), Number(dateParts[1] - 1), Number(dateParts[2]));
    return this.datePipe.transform(dateObject, 'dd-MM-yyyy');
  }

  public openServiceHistory(template: TemplateRef<any>) {
    // this.cpoeService.loadeOrderData();
    this.feeListService.onNavigationClick('Fees');

    const config: ModalOptions = {
      class: 'modal-dialog-centered modal-xl',
    };
    this.modalRef = this.modalService.show(template, config);
  }
}
