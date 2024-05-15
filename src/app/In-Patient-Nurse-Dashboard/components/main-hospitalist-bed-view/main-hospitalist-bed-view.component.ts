import { Component, OnInit,OnChanges,Input, ViewEncapsulation,Output,EventEmitter } from '@angular/core';
import { HospitalistType } from '../../../services/e-hospitalist/interfaces/hospitalist';

@Component({
  selector: 'app-main-hospitalist-bed-view',
  templateUrl: './main-hospitalist-bed-view.component.html',
  styleUrls: ['./main-hospitalist-bed-view.component.scss'],
  encapsulation: ViewEncapsulation.Emulated,
})
export class MainHospitalistBedViewComponent implements OnInit,OnChanges {
  @Input() listItem: Array<HospitalistType> = [];
  @Input() searchString: string;
  @Output() openModuleKardex = new EventEmitter();
  @Output() openModuleAdmissionProcessEvent = new EventEmitter();
  @Output() openModuleDischargeProcessEvent = new EventEmitter();

  constructor() { }
  ngOnInit(): void {
  }
  ngOnChanges() {
  }
  
  redirectToeKardex(data){
    this.openModuleKardex.emit(data);
  }
  
  openModuleAdmissionProcess(data) {
    this.openModuleAdmissionProcessEvent.emit(data);
  }

  openModuleDischargeProcess(data) {
    this.openModuleDischargeProcessEvent.emit(data);
  }
}
