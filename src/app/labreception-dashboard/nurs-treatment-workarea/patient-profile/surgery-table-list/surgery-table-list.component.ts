import { Component, EventEmitter, Input, OnInit, Output, SimpleChanges, OnChanges } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { EEmrService } from '@services/e-emr.service';
import { HospitalistService } from '@services/e-hospitalist/hospitalist.service';
import { EmergencyService } from '@services/emergency-dashboard/emergency-service';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';

@Component({
  selector: 'app-surgery-table-list',
  templateUrl: './surgery-table-list.component.html',
  styleUrls: ['./surgery-table-list.component.scss']
})
export class SurgeryTableListComponent implements OnInit,OnChanges {
  @Output() reloadTableData = new EventEmitter();

  @Input() surgeryList: any;
  @Input() searchString: any;
  modalRef: BsModalRef;
  columnList: any[] = [
    'Service Description',
    'Date',
    'Time',
    'Surgeon Name',
    'Treatment OU',
    'Department OU',
    'Additional Info'
  ];
  isCollpseOpen: boolean;
  record: any;
  imageUrl: any;
  pdfUrl: any;
  checkedFlag: any;
  text: string;
  constructor(public emergencyService: EmergencyService,private _dataServices: EEmrService,
    private modalService: BsModalService, private hospitalistService: HospitalistService,
    private sanitizer: DomSanitizer,) { }

  ngOnInit() {
  }
  ngOnChanges(changes: SimpleChanges): void {
    if(changes.surgeryList.currentValue.length) {
      this.isCollpseOpen = true;
    } else {
      this.isCollpseOpen = false;
    }
  }
}
