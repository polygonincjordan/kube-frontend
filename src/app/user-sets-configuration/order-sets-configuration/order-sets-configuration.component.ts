import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { OrdersDashboardService } from '@services/orders-dashboard/orders-dashboard.service';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { catchError, of } from 'rxjs';
import { Router } from '@angular/router';
import { BsModalRef, BsModalService, ModalOptions } from 'ngx-bootstrap/modal';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { OrderShowDetailComponent } from './order-show-detail/order-show-detail.component';

@UntilDestroy()
@Component({
  selector: 'app-order-sets-configuration',
  templateUrl: './order-sets-configuration.component.html',
  styleUrls: ['./order-sets-configuration.component.scss'],
})
export class OrderSetsConfigurationComponent implements OnInit {
  @ViewChild('ordershowId') orderShowDetails: OrderShowDetailComponent;
  modalRefForConformModal: BsModalRef;
  modalRefForDeleteOrder: BsModalRef;
  orderStatusList: any[] = [
    {
      id: '01',
      label: 'Draft' 
    },
    {
      id: '02',
      label: 'In Review' 
    },
    {
      id: '03',
      label: 'Approved' 
    },
  ]

  specialtyDeptList: any[] = [];
  ordersList: any[] = [];
  
  isExpanded: boolean = false;

  selectedSpecialtyDeptTab: any;
  isStatus: string;
  dateRange: any;
  selectedSpecialityDetail: string = '';
  searchString: string;
  selectedOrderDetail: any;
  specialtyValue: any;
  getOrderDetails: any;

  constructor(private _ordersDashboardService: OrdersDashboardService, private _router: Router, public modalService: BsModalService,public modalServiceComponent: NgbModal) {}

  ngOnInit(): void {
    this.getOrdersList();
    this.getSpecialityList();
  }

  getOrdersList() {
    let admdatefrom = '';
    let admdateto = '';
    let isStatus = '';
    if (this.dateRange) {
      admdatefrom = this.dateRange[0].toISOString().split('.')[0];
      admdateto = this.dateRange[1].toISOString().split('.')[0];
    }
    if(this.isStatus) isStatus = this.isStatus;
    const res = this._ordersDashboardService.getOrdersSetDataSet(isStatus, admdatefrom, admdateto, this.selectedSpecialityDetail);
    this._ordersDashboardService.ordersListData$
      .pipe(
        untilDestroyed(this),
        catchError((err) => {
          return of([]);
        })
      )
      .subscribe((data: any[]) => {
        this.ordersList = data;
      });
  }
  onSearchChange(event: any): void {
    this.searchString = event.target.value;
  }

  clearFilter() {
    this.dateRange = undefined;
    this.isStatus = undefined;
    this.getOrdersList();
  }

  getSpecialityList() {
    this._ordersDashboardService.getDeptSet()
    .pipe(
      untilDestroyed(this),
      catchError((err) => {
        return of([]);
      })
    )
    .subscribe((data: any) => {
      this.specialtyDeptList = data?.d?.results;
    });
  }

  orderListFilter() {
    this.getOrdersList();
  }

  selectedSpeciality(event) {
    if(event == undefined) event = '';
    this.selectSpeciDeptTab(event)
  }

  getStatusActive(status: any) {
    if(status == '1') {
      return 'Active';
    } else if(status == '2') {
      return 'Inactive';
    } else {
      return ''
    }
  }

  openOrderViewModal() {
    this.orderShowDetails.openModalForOrderDetails();
    this.getOrderSetByFavId(this.selectedOrderDetail.Id)
  }

  getOrderSetByFavId(id: string) {
    this._ordersDashboardService
      .getOrderSetByOrderId(id)
      .subscribe((_success: any) => {
        this.getOrderDetails =  _success?.d?.results[0];
       this.getOrderDetails?.ToSubtitle?.results.sort((a, b) => (a.Seqno < b.Seqno ? -1 : 1));
       })
  }

  sendBtn(item) {
    if(item.StatusAprDesc == 'Draft') {
      return 'Send for Review';
    } else if(item.StatusAprDesc == 'In Review') {
      return 'Approve Order Set'
    } else {
      return
    }
  }

  selectSpeciDeptTab(type: any) {
    if (this.selectedSpecialityDetail == type) {
      this.selectedSpecialityDetail = '';
      this.specialtyValue = undefined
    } else {
      this.selectedSpecialityDetail = type;
      this.specialtyValue = type;
    }
    this.selectedOrderDetail = '';
    this.getOrdersList();
  }

  getImageBorderLogic(item) {
    return (
      (item.StatusApr === '03' && {
        background: '#45cd82',
        color: '#fff',
      }) ||
      (item.StatusApr === '01' && {
        background: '#fb5276',
        color: '#fff',
      }) ||
      (item.StatusApr === '02' && {
        background: '#f78645',
        color: '#fff',
      })
    );
  }

  selectOrderDetail(orderDetail: any) {
    if (orderDetail.Id == this.selectedOrderDetail?.Id) {
      this.selectedOrderDetail = ''
    } else {
      this.selectedOrderDetail = orderDetail;
    }
  }

  getStatusName(type) {
    if (type == '1') {
      return 'Not Started';
    } else if (type == '2') {
      return 'In Review';
    } else if (type == '3') {
      return 'Completed';
    }
  }

  getDate(value) {
    if (value) {
      var str = value;
      var num = parseInt(str.replace(/[^0-9]/g, ''));
      var date = new Date(num);
      return date;
    }
  }

  handleSidebarToggle() {
    this.isExpanded = !this.isExpanded;
  }

  routerLinkForEdit(item) {
    if(!item) return;
    this._router.navigateByUrl('/orders-dashboard/order-create?id=' + item.Id)
  }

  routerLinkForClone(item) {
    if(!item) return;
    this._router.navigateByUrl('/orders-dashboard/order-create?cloneId=' + item.Id)
  }

  isDesc: boolean = false;
  column: string = 'Name';

  sort(property) {
    this.isDesc = !this.isDesc; //change the direction    
    this.column = property;
    let direction = this.isDesc ? 1 : -1;

    this.ordersList.sort(function (a, b) {
      if (a[property] < b[property]) {
        return -1 * direction;
      }
      else if (a[property] > b[property]) {
        return 1 * direction;
      }
      else {
        return 0;
      }
    });
  };

  changeStatus() {
    this._ordersDashboardService
    .sendForStatusChange(this.selectedOrderDetail.Id)
    .pipe(
      untilDestroyed(this),
      catchError((err) => {
        return of([]);
      })
    )
    .subscribe((data: any) => {
      this.modalRefForConformModal.hide();
      this.getOrdersList();
      this.selectedOrderDetail = '';
    });
  }

  removeOrderModal(template: TemplateRef<any>) {
    const config: ModalOptions = {
      class: 'modal-dialog-centered',
    };
    this.modalRefForDeleteOrder = this.modalService.show(template, config);
  }

  removeOrderAPI() {
    this._ordersDashboardService
    .removeOrderTemplate(this.selectedOrderDetail.Id)
    .subscribe(
      (element) => {
        this.getOrdersList();
        this.getSpecialityList();
        this.modalRefForDeleteOrder.hide();
      },
      (error) => {}
    );
  }

  forConformationModal(template: TemplateRef<any>, selectedOrderDetail) {
    const config: ModalOptions = {
      class: 'modal-dialog-centered',
    };
    this.modalRefForConformModal = this.modalService.show(template, config);
    
  }

  modalStatusInfor() {
    if(this.selectedOrderDetail.StatusAprDesc == 'In Review') {
      return 'approve';
    } else if(this.selectedOrderDetail.StatusAprDesc == 'Draft') {
      return 'send for review'
    } else {
      return;
    }
  }

  accessLevelValue(status) {
    if(status == '1') {
      return 'General';
    } else if(status == '2'){
      return 'User';
    } else {
      return '';
    }
  }
}
