import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-daily-nursing-assessment-newborn',
  templateUrl: './daily-nursing-assessment-newborn.component.html',
  styleUrls: ['./daily-nursing-assessment-newborn.component.scss'],
})
export class DailyNursingAssessmentNewbornComponent implements OnInit {
  public CurrentDateAndTime: Date = new Date();
  currentTime: any;
  toAllergyArr: any;
  toVitalsArr: any;
  activeTab: string = 'Neurosensory'; // Default tab
  oxygenModes = [
    { value: 0, label: 'Free Flow' },
    { value: 1, label: 'Face Mask' },
    { value: 2, label: 'Nasal Cannula' },
    { value: 3, label: 'Room Air' },
    { value: 4, label: 'Oxyhood' }
  ];

  yesNoList = [
    { value: 0, label: 'Yes' },
    { value: 1, label: 'No' }
  ];

  feedingTypes = [
    { value: 0, label: 'Breast Feeding' },
    { value: 1, label: 'Formula' },
    { value: 2, label: 'NG Tube' }
  ];
  
  constructor() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    this.currentTime = `${hours}:${minutes}:${seconds}`;
  }

  ngOnInit(): void {}

  setActiveTab(tab: string): void {
    this.activeTab = tab;
  }
}
