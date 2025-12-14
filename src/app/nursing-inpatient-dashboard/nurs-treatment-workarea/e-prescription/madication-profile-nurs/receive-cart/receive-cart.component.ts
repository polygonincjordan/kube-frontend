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
  cartDetails: any;
  cartModalRef: BsModalRef;
  isCollapsed: boolean = false;
  receiveCartForm: FormGroup;
  selectedCart: any;

  get isAllSelected(): boolean {
    return this.selectedCart?.TOCONTENT?.results?.every(medication => medication.isChecked);
  }

  nurseUnitList = [
    { code: "4THFL-C", description: "4th Floor-Zone C-IP" },
    { code: "4THFLVIP", description: "4th Floor-Zone B-VIP" },
    { code: "6FL-NURS", description: "6th Floor Nursery Unit" },
    { code: "6FL-OROU", description: "6th Floor LDR Operation Rooms" },
    { code: "6FL-NICU", description: "6th Floor NICU" },
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

    this.receiveCartForm = this.formBuilder.group({
      dateFrom: [new Date()],
      dateTo: [new Date()],
      timeFrom: ['00:00'],
      timeTo: ['23:59'],
      nurseUnit: ['']
    });    
    this.setCodeByDescription(checkindata.Floor);
  }

  setCodeByDescription(desc: string) {
    const matchedUnit = this.nurseUnitList.find(unit =>
      unit.description.toLowerCase().includes(desc.toLowerCase().trim())
    );

    if (matchedUnit) {
      this.receiveCartForm.patchValue({ nurseUnit: matchedUnit.code });
    }
  }

  refreshList() {
    this.receiveCartForm.get('dateFrom').setValue(new Date());
    this.receiveCartForm.get('dateTo').setValue(new Date());
    this.receiveCartForm.get('timeFrom').setValue('00:00');
    this.receiveCartForm.get('timeTo').setValue('23:59');
    this.selectedCart = undefined;
    this.getReceiveCartList()
  }

  getReceiveCartList() {
    let data = this.receiveCartForm.value
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
    this.emergencyService.getReceiveCart(fromDate, toDate, timeFrom, timeTo, data.nurseUnit).subscribe((res: any) => {
      if (res) {
        this.cartList = res.d?.results;
        this.refreshSelectedCart();
      }
    }, (_error: any) => { })
  }

  refreshSelectedCart() {
    const cartId = this.selectedCart?.Cartid;
    if (!cartId) return;

    this.selectedCart = this.cartList?.find(cart => cart.Cartid == cartId);
  }

  formatTimeToISO8601(time: string): string {
    const [hours, minutes] = time.split(':').map(Number);
    const duration = `PT${hours}H${minutes}M00S`;
    return duration;
  }

  openCartDetailModal(event: Event, template: TemplateRef<any>, cart: any) {
    event.stopPropagation();
    this.selectedCart = undefined;
    this.cartDetails = cart;
    
    const config: ModalOptions = { class: 'modal-dialog-centered lab-modal-size' };
    this.cartModalRef = this.modalService.show(template, config);
  }

  selectMedication(event: any, selectedMedication: any) {
    const isChecked = event.target.checked;
    selectedMedication.isChecked = isChecked;
  }

  selectAllMedications(event: any) {
    const isChecked = event.target.checked;
    this.setSelection(isChecked);
  }
  
  setSelection(value: boolean) {
    this.selectedCart?.TOCONTENT?.results?.forEach(medication => medication.isChecked = value);
  }

  isSelectedCart(cart): boolean {
    return this.selectedCart?.Cartid === cart?.Cartid;
  }

  toggleCartSelection(cart: any) {
    // reset selection on cart change
    this.setSelection(false);

    // if selected cart is clicked again, deselect it
    this.selectedCart = this.isSelectedCart(cart) ? undefined : cart;
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

  addReceiveCart(missed: boolean = false) {
    const selectedMedications = this.selectedCart?.TOCONTENT?.results?.filter(medication => medication.isChecked);
    if (!selectedMedications?.length) return;

    // remove 'isChecked' key for SAP compatibility
    const results = selectedMedications.map(({ isChecked: _isChecked, ...medication }) => medication); 
    
    const cart = { 
      ...this.selectedCart, 
      TOCONTENT: { ...this.selectedCart?.TOCONTENT, results: results }
    };

    if (missed) {
      cart.Missed = 'X';
    }

    this.emergencyService.addReceiveCart(cart).subscribe(() => {
      this.setSelection(false);
      this.getReceiveCartList();
    });
  }
}
