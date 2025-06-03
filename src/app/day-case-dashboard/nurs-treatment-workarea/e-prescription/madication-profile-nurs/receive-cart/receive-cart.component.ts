import { DatePipe } from '@angular/common';
import { Component, OnInit, TemplateRef } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { EmergencyService } from '@services/emergency-dashboard/emergency-service';
import { StorageService } from '@services/storage.service';
import { BsModalRef, BsModalService, ModalOptions } from 'ngx-bootstrap/modal';

@Component({
  selector: 'app-receive-cart',
  templateUrl: './receive-cart.component.html',
  styleUrls: ['./receive-cart.component.scss']
})
export class ReceiveCartComponent implements OnInit {

  cartList: any;
  cartPopUpDetail: any;
  modalRef: BsModalRef;
  cartmodalRef: BsModalRef;
  isCollapsed: boolean = false;

  receviceCartForm: FormGroup
  cardSection: boolean;
  selectedColData: any;
  childCartDetails: any;
  
  nurseUnitList = [
    { code: "4THFL-C", description: "4th Floor-Zone C-IP" },
    { code: "4THFLVIP", description: "4th Floor-Zone B-VIP" },
    { code: "6FL-NURS", description: "6th Floor Nursery Unit" },
    { code: "6FL-OROU", description: "6th Floor LDR Operation Rooms" },
    { code: "CATTUAMC", description: "Cath Lab Unit" },
    { code: "F9GOTAMC", description: "Major OT (GRAL)" },
    { code: "LDRASMTU", description: "6th Floor LDR Birthing Unit" },
    { code: "LDRINTOU", description: "6th Floor Neonatal Intermediat" },
    { code: "F21IUAMC", description: "2nd Floor-Zone C-IP" },
    { code: "F31IUAMC", description: "3rd Floor-Zone C-IP" },
    { code: "F3CIUAMC", description: "3rd Floor IDU" },
    { code: "F51IUAMC", description: "5th Floor-Zone C-IP" },
    { code: "F5VIUAMC", description: "5th Floor-Zone B-IP" },
    { code: "F6CIUAMC", description: "6th Floor-Zone C-IP" },
    { code: "F7IIUAMC", description: "7th Class 2-3 Medical/Surgical" },
    { code: "F9DIUAMC", description: "9th Floor Day Surgery" },
    { code: "F9GOTAMC", description: "Major OT (GRAL)" },
    { code: "F9IIUAMC", description: "9th Floor ICU Area" }
  ];
  constructor(private formBuilder: FormBuilder, private emergencyService: EmergencyService, private modalService: BsModalService, private storageService: StorageService) { }

  ngOnInit(): void {
    this.initForm()
  }

  initForm() {
    let checkindata: any = JSON.parse(localStorage.getItem('checkindata'));
    this.receviceCartForm = this.formBuilder.group({
      dateFrom: [new Date()],
      dateTo: [new Date()],
      timeFrom: ['00:00'],
      timeTo: ['23:59'],
      nurseUnit: ['F9DIUAMC']
    });    
    this.setCodeByDescription(checkindata.Floor);
  }

  setCodeByDescription(desc: string) {
    const matchedUnit = this.nurseUnitList.find(unit =>
      unit.description.toLowerCase().includes(desc.toLowerCase().trim())
    );

    if (matchedUnit) {
      this.receviceCartForm.patchValue({ nurseUnit: matchedUnit.code });
    }
  }

  refreshList() {
    this.receviceCartForm.get('dateFrom').setValue(new Date());
    this.receviceCartForm.get('dateTo').setValue(new Date());
    this.receviceCartForm.get('timeFrom').setValue('00:00');
    this.receviceCartForm.get('timeTo').setValue('23:59');
    this.cardSection = false
    this.getReceviceCartList()
  }

  getReceviceCartList() {
    let data = this.receviceCartForm.value
    const timeFrom = this.formatTimeToISO8601(data.timeFrom);
    const timeTo = this.formatTimeToISO8601(data.timeTo);
    const fromDate = `${new DatePipe('en-US').transform(
      data.dateFrom ? data.dateFrom : new Date().setDate(new Date().getDate()),
      'yyyy-MM-dd'
    )}T00:00:00`
    const toDate = `${new DatePipe('en-US').transform(
      data.dateTo ? data.dateTo : new Date().setDate(new Date().getDate()),
      'yyyy-MM-dd'
    )}T00:00:00`
    this.emergencyService.getReceviceCart(fromDate, toDate, timeFrom, timeTo, data.nurseUnit).subscribe((res: any) => {
      if (res) {
        this.cartList = res.d?.results
      }
    }, (_error: any) => { })
  }

  formatTimeToISO8601(time: string): string {
    const [hours, minutes] = time.split(':').map(Number);
    const duration = `PT${hours}H${minutes}M00S`;
    return duration;
  }


  filterData() {
    // this.listItem.filter((data) => data.Us)
  }

  openCartDetailModal(event: Event, template: TemplateRef<any>, data) {
    const config: ModalOptions = { class: 'modal-dialog-centered lab-modal-size' };
    this.cartmodalRef = this.modalService.show(template, config);
    this.cardSection = false;
    event.stopPropagation();
    this.cartPopUpDetail = data;
    this.cartmodalRef.onHide.subscribe((reason: string | any) => {
    });
  }

  checkboxChangedMedication(event: any, item: any) {
    this.cartList.find(x => x.CartExtId == item.CartExtId).isChecked = event.target.checked;
  }
  selectDateColumn(index: number, data: any) {
    if (this.selectedColData === index) {
      this.selectedColData = undefined;
      this.cardSection = false
    } else {
      this.selectedColData = index;
      this.cardSection = true
      this.childCartDetails = data;
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

  getTime(value) {
    if (value) {
      var str = value;
      var str = str.replace(/[PT]/g, '');
      var str = str.replace(/[H]/g, ':');
      var str = str.replace(/[M]/g, ':');
      var str = str.replace(/[S]/g, '');
      var str = str.split(':');
      var finalstr = str[0] + ':' + str[1];
      return finalstr;
    }
  }

  addReceviceCard() {
    this.cartList.forEach((e) => {
      if (e.isChecked) {
        delete e.isChecked;
        this.emergencyService.addReceviceCart(e).subscribe((res: any) => {
        }, (error: any) => { })
      }

    })

  }

  addReceviceMissedCard() {
    this.cartList.forEach((e) => {
      if (e.isChecked) {
        delete e.isChecked;
        e.Missed = "X";
        this.emergencyService.addReceviceCart(e).subscribe((res: any) => {
        }, (error: any) => { })
      }
    })
  }
}
