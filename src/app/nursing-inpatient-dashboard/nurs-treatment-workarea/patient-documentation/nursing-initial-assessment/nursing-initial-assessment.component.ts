import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-nursing-initial-assessment',
  templateUrl: './nursing-initial-assessment.component.html',
  styleUrls: ['./nursing-initial-assessment.component.scss']
})
export class NursingInitialAssessmentComponent implements OnInit {
  activeTab: string = 'persoalData'
  activeTab3: string = 'postPartumAssessment'
  activeTab2: string = 'functionalAssessment'
  items:[]
  statusDescriptions = [
    { id: 0, label: 'Normal' },
    { id: 1, label: 'Birth Defects' },
    { id: 2, label: 'Premature' },
    { id: 3, label: 'Post Mature' }
  ];

  bloodGroups = [
    { id: 0, label: 'A-' },
    { id: 1, label: 'A+' },
    { id: 2, label: 'B-' },
    { id: 3, label: 'B+' },
    { id: 4, label: 'O-' },
    { id: 5, label: 'O+' },
    { id: 6, label: 'AB-' },
    { id: 7, label: 'AB+' }
  ];
  pain = [
    { id: 0, label: '1' },
    { id: 1, label: '2' },
    { id: 2, label: '3' },
    { id: 3, label: '4' },
    { id: 4, label: '5' },
    { id: 5, label: '6' },
    { id: 6, label: '7' },
    { id: 7, label: '8' },
    { id: 7, label: '9' },
    { id: 7, label: '10' }
  ];
  constructor() { }

  ngOnInit(): void {
  }

  setActiveTab(tab: string): void {
    this.activeTab = tab;

  }
  setActiveTab2(tab: string): void {
    this.activeTab2 = tab;
 
  }
  setActiveTab3(tab: string): void {
    this.activeTab3 = tab;
  }

}
