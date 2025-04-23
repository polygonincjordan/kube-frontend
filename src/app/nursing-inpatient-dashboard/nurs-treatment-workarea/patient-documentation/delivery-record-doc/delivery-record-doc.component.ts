import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-delivery-record-doc',
  templateUrl: './delivery-record-doc.component.html',
  styleUrls: ['./delivery-record-doc.component.scss']
})
export class DeliveryRecordDocComponent implements OnInit {
  items:any;
  activeTab: string = 'firstStage';
  constructor() { }

  ngOnInit(): void {
  }

  setActiveTab(tab: string): void {
    this.activeTab = tab;
  }

}
