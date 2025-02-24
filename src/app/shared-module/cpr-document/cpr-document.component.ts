import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-cpr-document',
  templateUrl: './cpr-document.component.html',
  styleUrls: ['./cpr-document.component.scss']
})
export class CprDocumentComponent implements OnInit {

  tabList = [
    'Cardiopulmonary Resuscitation',
    'Diagnosis',
    'CPR Medication',
    'Vitals',
  ];

  selectedTabName: string = 'Cardiopulmonary Resuscitation';
  
  constructor() { }

  ngOnInit(): void {
  }

  assessmentTabSelect(tabName: string) {
    this.selectedTabName = tabName;
  }
}
