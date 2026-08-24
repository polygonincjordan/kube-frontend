import {
  Component,
  Input,
  OnInit,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { BsModalRef, BsModalService, ModalOptions } from 'ngx-bootstrap/modal';

@Component({
  selector: 'app-order-show-detail',
  templateUrl: './order-show-detail.component.html',
  styleUrls: ['./order-show-detail.component.scss'],
})
export class OrderShowDetailComponent implements OnInit {
  @ViewChild('orderDetailModal', { static: true })
  orderDetailModal: TemplateRef<any>;
  @Input() getOrderDetails;
  modalRef: BsModalRef;
  isCollapsed = false;
  physicianListView: any;

  constructor(private modalServiceForShowOrderDetails: BsModalService) {}

  ngOnInit(): void {}

  openModalForOrderDetails() {
    const config: ModalOptions = {
      class: 'modal-dialog-centered order-details-modal-size',
    };
    this.modalRef = this.modalServiceForShowOrderDetails.show(
      this.orderDetailModal,
      config
    );
  }

  getImageBorderLogic(item) {
    return (
      (item?.StatusApr === '03' && {
        background: '#45cd82',
        color: '#fff',
      }) ||
      (item?.StatusApr === '01' && {
        background: '#fb5276',
        color: '#fff',
      }) ||
      (item?.StatusApr === '02' && {
        background: '#f78645',
        color: '#fff',
      })
    );
  }

  medicationListNew:any;
  labListNew:any;
  radListNew:any;
  phyOrderListNew:any;
  procerdureListNew:any;
  diagnosisListView:any;
  dispensingListView: any;
  surgeryOrderListView: any;
  admissionOrderListView: any;
  fetchSubtitleRecords(stid) {
    this.medicationListNew=this.getOrderDetails?.ToMedOrd?.results.filter((e) => e.Stid === stid && e.Purpose == '03');
    this.dispensingListView=this.getOrderDetails?.ToMedOrd?.results.filter((e) => e.Stid === stid && e.Purpose == '01');
    this.labListNew=this.getOrderDetails?.ToLab?.results.filter((e) => e.Stid === stid);
    this.radListNew=this.getOrderDetails?.ToRad?.results.filter((e) => e.Stid === stid);
    this.procerdureListNew=this.getOrderDetails?.ToServices?.results.filter((e) => e.Stid === stid);
    this.phyOrderListNew=this.getOrderDetails?.ToPhyOrd?.results.filter((e) => e.Stid === stid);
    this.diagnosisListView=this.getOrderDetails?.ToNdia?.results.filter((e) => e.Stid === stid);
    this.physicianListView=this.getOrderDetails?.ToPhyOrd?.results.filter((e) => e.Stid === stid);
    this.surgeryOrderListView=this.getOrderDetails?.ToSurgy?.results.filter((e) => e.Stid === stid);
    this.admissionOrderListView=this.getOrderDetails?.ToAdm?.results.filter((e) => e.Stid === stid);
    console.log(this.admissionOrderListView, "--");
    
  }

  parseFloat(value) {
    if(value) return parseFloat(value).toFixed(3);
    else  return '';  
  }

  checkStatusValue(value) {
    if (value == '1') return true;
    else return false;
  }

  purposeValue(descr) {
    if (descr == '01') {
      return 'Dispensing';
    } else if (descr == '02') {
      return 'Prescription';
    } else if (descr == '03') {
      return 'Administration';
    } else {
      return '';
    }
  }

  getTreatmentName(value) {
    if(value) {
      return 'Treatment'
    } else {
      return 'Referral'
    }
  }

}
