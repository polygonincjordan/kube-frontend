import { DatePipe } from '@angular/common';
import { Component, Input, OnInit, TemplateRef } from '@angular/core';
import { DataService } from '@services/data.service';
import { CpoeService } from '@services/emergency-dashboard/cpoe.service';
import { eOrderService } from '@services/eorder.service';
import { FeeListService } from '@services/fee-service/fee-list.service';
import { BsModalRef, BsModalService, ModalOptions } from 'ngx-bootstrap/modal';
import { NgxSpinnerService } from 'ngx-spinner';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-fee-order-history',
  templateUrl: './fee-order-history.component.html',
  styleUrls: ['./fee-order-history.component.scss'],
})
export class FeeOrderHistoryComponent implements OnInit {
  @Input('orderHistory') orderHistory: any;

  modalRef: BsModalRef;

  constructor(public eorderService: eOrderService, public feeListService: FeeListService, private spinner: NgxSpinnerService, private dataService: DataService,
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

  confirmationForRiskDelete(item) {
    Swal.fire({
      text: 'Are you sure you want to delete?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes',
      cancelButtonText: 'No',
      customClass: { popup: 'myalertpopup' },
    }).then((result) => {
      if (result.value) {
        this.onDeleteFeeSelect(item);
      }
    });
  }

  onDeleteFeeSelect(element: any) {
    this.spinner.show();
    let postObject: any = {};
    postObject['Einri'] = element.Einri;
    postObject['Falnr'] = element.Falnr

    let feeOrder: any = [];

    feeOrder.push({
      Einri: element.Einri,
      Falnr: element.Falnr,
      Lfdnr: element.lfdnr,
      Talst: element.Talst,
      Tarif: element.Tarif,
      Ktxt1: element.Ktxt1,
      Fprice: element.Price,
      Funit: element.Unit,
      Ibgdt: element.Ibgdt,
      Remrk: element.Remarks,
      Storn: 'X',
      Lnrls: element.Lnrls,
    });

    postObject['TOORDLISTSET'] = feeOrder;
    this.dataService.postData('FeesOrderSet', postObject, false).subscribe(
      (success: any) => {
        let isBilledData = postObject.TOORDLISTSET.filter(d => d.Billed);
        Swal
          .fire({
            title: postObject.TOORDLISTSET.length > 1 ? 'Fee Order Deleted' : '',
            html: postObject.TOORDLISTSET.length < 1 && isBilledData && isBilledData.length ? `Fee Service <b>${postObject.TOORDLISTSET[0].Ktxt1}</b> has been billed on <b>${postObject.TOORDLISTSET[0].Ibgdt.split('T')[0]}</b> Cancellation is not Possible`
              : 'Your Fee Order has been Deleted',
            confirmButtonColor: '#0890c5',
            confirmButtonText: 'OK',
            backdrop: true,
            icon: 'success',
            customClass: { popup: 'myalertpopup' },
          })
          .then((result) => {
          });
          this.feeListService.resetView();
          this.spinner.hide();
      },
      (error: any) => {
        Swal
          .fire({
            title: error.statusText,
            text: JSON.parse(error._body).error?.message.value,
            confirmButtonColor: '#096798',
            confirmButtonText: 'close',
            customClass: { popup: 'myalertpopup' },
            backdrop: true,
            icon: 'error',
          })
          .then((result) => {
            this.spinner.hide();
          });
      }
    );
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
