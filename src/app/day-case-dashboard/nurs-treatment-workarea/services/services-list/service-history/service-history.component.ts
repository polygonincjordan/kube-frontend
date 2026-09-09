import { DatePipe } from '@angular/common';
import { Component, Inject, Input, OnInit, TemplateRef } from '@angular/core';
import { FormArray, FormGroup } from '@angular/forms';
import { DataService } from '@services/data.service';
import { FeeListService } from '@services/fee-service/fee-list.service';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { NgxSpinnerService } from 'ngx-spinner';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-service-history',
  templateUrl: './service-history.component.html',
  styleUrls: ['./service-history.component.scss']
})
export class ServiceHistoryComponent implements OnInit {

  @Input('orderHistory') orderHistory: any;
  public selectedData: any;
  public modalRef?: BsModalRef | null;

  public feeServiceListItems: FormArray;
  // public orderHistory: FormGroup;
  constructor(
    public feeListService: FeeListService,
    public modalService: BsModalService,
    private spinner: NgxSpinnerService,
    private dataService: DataService,
    @Inject(DatePipe) private datePipe: DatePipe,
  ) { }

  ngOnInit(): void { }

  ngOnDestroy() { this.orderHistory = []; }

  openComments(template: TemplateRef<any>, data) {
    this.modalRef = this.modalService.show(template, {
      id: 1,
      class: 'additional-info-temp modal-lg',
    });
    this.selectedData = data;
  }

  getStatusValue(item: any) {
    if(item == "") {
      return "Released";
    } else if(item == "X") {
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
}
