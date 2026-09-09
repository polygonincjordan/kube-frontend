import { Component, Input, OnInit, ViewEncapsulation,Output,EventEmitter } from '@angular/core';
import { HospitalistType } from '@services/e-hospitalist/interfaces/hospitalist';

@Component({
  selector: 'app-bed-view-item',
  templateUrl: './bed-view-item.component.html',
  styleUrls: ['./bed-view-item.component.scss'],
  encapsulation: ViewEncapsulation.Emulated,
})
export class BedViewItemComponent implements OnInit {
  @Input() item: HospitalistType;
  @Output() openModuleKardex = new EventEmitter();
  @Output() openModuleAdmissionProcessEvent = new EventEmitter();
  @Output() openModuleDischargeProcessEvent = new EventEmitter();

  constructor() {}

  ngOnInit(): void {}
  getImgSrc() {
    switch (this.item.Bediconcolor) {
      case 'Purple':
        return 'assets/img/bed-1.png';
      case 'Red':
        return 'assets/img/bed-3.png';
      default:
        return 'assets/img/bed-2.png';
    }
  }


  redirectToeKardex(data){
    this.openModuleKardex.emit(data);
  }

  openModuleAdmissionProcess(data){
    this.openModuleAdmissionProcessEvent.emit(data);
  }

  openModuleDischargeProcess(data){
    this.openModuleDischargeProcessEvent.emit(data);
  }

  getDate(value) {
    if (value) {
      var str = value;
      var num = parseInt(str.replace(/[^0-9]/g, ''));
      var date = new Date(num);
      return date;
    }
  }

}
