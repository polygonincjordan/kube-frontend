import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-delivery-record-doc',
  templateUrl: './delivery-record-doc.component.html',
  styleUrls: ['./delivery-record-doc.component.scss']
})
export class DeliveryRecordDocComponent implements OnInit {
  activeTab: string = 'firstStage';
  public CurrentDateAndTime: Date = new Date();
    status = [
      { value: 0, label: 'Normal' },
      { value: 1, label: 'Birth Defects' },
      { value: 2, label: 'Premature' },
      { value: 3, label: 'Post Mature' },
    ];
  currentTime: string;
  
  constructor() { 
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    this.currentTime = `${hours}:${minutes}:${seconds}`;
  }

  ngOnInit(): void {
  }

  setActiveTab(tab: string): void {
    this.activeTab = tab;
  }

}
