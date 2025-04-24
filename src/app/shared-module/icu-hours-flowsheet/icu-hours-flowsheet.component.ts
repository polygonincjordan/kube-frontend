import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-icu-hours-flowsheet',
  templateUrl: './icu-hours-flowsheet.component.html',
  styleUrls: ['./icu-hours-flowsheet.component.scss']
})
export class IcuHoursFlowsheetComponent implements OnInit {

  activeTab: string = '1'; // Default tab
  tabItems = [
    { label: 'Medical Devices', value: '1' },
    { label: 'Scales', value: '2' },
    { label: 'Significant Lab Results', value: '3' },
    { label: 'Restraints Monitoring', value: '4' },
    { label: 'Pressure Score Risk Assessment', value: '5' },
    { label: 'Wound Care', value: '6' },
    { label: 'Ventilator Settings', value: '7' },
    { label: 'Edema', value: '8' },
    { label: 'Intake/Output', value: '9' },
    { label: 'Physical Examination', value: '10' },
  ];

  constructor() { }

  ngOnInit(): void {
  }

  setActiveTab(tab: string): void {
    this.activeTab = tab;
  }

}
