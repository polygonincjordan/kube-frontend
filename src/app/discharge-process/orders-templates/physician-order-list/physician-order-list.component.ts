import {
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter,
  TemplateRef,
} from '@angular/core';
import { HospitalistService } from '@services/e-hospitalist/hospitalist.service';
import { EmergencyService } from '@services/emergency-dashboard/emergency-service';
import { BsModalRef, BsModalService, ModalOptions } from 'ngx-bootstrap/modal';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-physician-order-list',
  templateUrl: './physician-order-list.component.html',
  styleUrls: ['./physician-order-list.component.scss'],
})
export class PhysicianOrderListComponent implements OnInit {
  @Input() physicianOrderList: any;
  @Output() reloadPhyOrderTable = new EventEmitter();

  modalRef: BsModalRef;
  phyOrderAction: any;
  phyOrderData: any;
  cancelReasonValue: any = '';
  errmsg: string;
  cancelReasonListData: any;
  constructor(
    private modalService: BsModalService,
    private _hospitallistService: HospitalistService, public emergencyService: EmergencyService
  ) {}

  ngOnInit(): void {
    this.cancelReasonList();
  }

  getDate(value) {
    if (value) {
      var str = value;
      var num = parseInt(str.replace(/[^0-9]/g, ''));
      var date = new Date(num);
      return date;
    }
  }

  public openModalForPhyOrder(
    template: TemplateRef<any>,
    data: any,
    action: any
  ) {
    this.phyOrderAction = action;
    this.phyOrderData = data;
    if (action == 'execute') {
      const config: ModalOptions = {
        class: 'modal-dialog-centered execute-delete-modal',
      };
      this.modalRef = this.modalService.show(template, config);
    }
    if (action == 'delete') {
      const config: ModalOptions = {
        class: 'modal-dialog-centered execute-delete-modal',
      };
      this.modalRef = this.modalService.show(template, config);
    }
  }

  cancelReasonList() {
    this._hospitallistService.cancelReasonList().subscribe(
      (_success: any) => {
        this.cancelReasonListData = _success.d.results;
      },
      (_error: any) => {}
    );
  }

  physicianOrderSet(phyOrderData, action) {
    let json;
    if (action == 'execute') {
      this.modalRef.hide();
      json = {
        PorderId: phyOrderData.PorderId,
        CancelIndicator: false,
        ActionExecute: 'X',
      };

      this._hospitallistService.physicianOrderSet(json).subscribe(
        (_success: any) => {
          this.refreshModules();
          Swal.fire({
            title: 'Physician Order has been Executed',
            icon: 'success',
            confirmButtonText: 'OK',
          });
        },
        (_error: any) => {
          Swal.fire({
            title: 'Something went wrong',
            icon: 'error',
            confirmButtonText: 'OK',
          });
        }
      );
    } else {
      json = {
        PorderId: phyOrderData.PorderId,
        CancelIndicator: true,
        ActionExecute: '',
        CancelReason: this.cancelReasonValue,
      };

      if (this.cancelReasonValue == '') {
        this.errmsg = 'Select a Reason for Deletion';
      } else {
        this.modalRef.hide();
        this._hospitallistService.physicianOrderSet(json).subscribe(
          (_success: any) => {
            this.refreshModules();
            Swal.fire({
              title: 'Physician Order has been Deleted',
              icon: 'success',
              confirmButtonText: 'OK',
            });
          },
          (_error: any) => {
            Swal.fire({
              title: 'Something went wrong',
              icon: 'error',
              confirmButtonText: 'OK',
            });
          }
        );
      }
    }
  }

  refreshModules() {
    this.reloadPhyOrderTable.next('reloadPhyOrderTable');
  }
}
