import { Component, EventEmitter, Input, OnInit, Output, SimpleChanges, OnChanges } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { EEmrService } from '@services/e-emr.service';
import { HospitalistService } from '@services/e-hospitalist/hospitalist.service';
import { EmergencyService } from '@services/emergency-dashboard/emergency-service';
import { eOrderService } from '@services/eorder.service';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
@Component({
  selector: 'app-surgery-table-list',
  templateUrl: './surgery-table-list.component.html',
  styleUrls: ['./surgery-table-list.component.scss']
})
export class SurgeryTableListComponent implements OnInit,OnChanges {

  @Output() reloadTableData = new EventEmitter();
  @Output() deleteItem = new EventEmitter<any>();

  @Input() surgeryList: any;
  @Input() searchString: any;
  modalRef: BsModalRef;
  columnList: any[] = [
    'Service Description',
    'Order Date',
    'Order Time',
    'Surgeon Name',
    'Surgery Date/Time',
    'Treatment OU',
    'Department OU',
    'Created By',
    'Anesthesia Required',
    'Additional Info',
    'Delete',
  ];
  isCollpseOpen: boolean;
  record: any;
  imageUrl: any;
  pdfUrl: any;
  checkedFlag: any;
  text: string;
  constructor(public emergencyService: EmergencyService,private _dataServices: EEmrService,
    private modalService: BsModalService, private hospitalistService: HospitalistService,
    private sanitizer: DomSanitizer,
    public eorderService: eOrderService) { }

  ngOnInit() {
  }
  ngOnChanges(changes: SimpleChanges): void {
    if(changes.surgeryList.currentValue.length) {
      this.isCollpseOpen = true;
    } else {
      this.isCollpseOpen = false;
    }
  }

  getTime(value) {
    if (value) {
      var str = value;
      var str = str.replace(/[PT]/g, '');
      var str = str.replace(/[H]/g, ':');
      var str = str.replace(/[M]/g, ':');
      var str = str.replace(/[S]/g, '');
      return str;
    }
  }

}
