import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-sbar-nursing-endorsement',
  templateUrl: './sbar-nursing-endorsement.component.html',
  styleUrls: ['./sbar-nursing-endorsement.component.scss']
})
export class SbarNursingEndorsementComponent implements OnInit {
  toVitalsArr:any
  toAllergyArr:any
  toDiagnosisArr:any
  yesNoOptions = [
    { value: '0', label: 'Yes' },
    { value: '1', label: 'No' },
  ];
  public scalesList: any[] = [
    {
      ScaleType: 'Modified Aldrete Score (MAS)',
      LastScore: '',
      ScoreDesc: '',
      Datetimee: '',
      value: '1',
      Dockey: '',
    },
    {
      ScaleType: '',
      LastScore: '',
      ScoreDesc: '',
      Datetimee: '',
      value: '2',
      Dockey: '',
    },
    {
      ScaleType: '',
      LastScore: '',
      ScoreDesc: '',
      Datetimee: '',
      value: '3',
      Dockey: '',
    },
  ];
  constructor() { }

  ngOnInit(): void {
  }
  //For First Tab
  activeTabFirst: string = 'chifComplaint'; // Default tab
  setActiveTabFirst(tab: string): void {
    this.activeTabFirst = tab;
  }

  //For Second Tab
  activeTabSecond: string = 'allergies'; // Default tab
  setActiveTabSecond(tab: string): void {
    this.activeTabSecond = tab;
  }

  //For Third Tab
  activeTabThird: string = 'risk'; // Default tab
  setActiveTabThird(tab: string): void {
    this.activeTabThird = tab;
  }

  //For Third Tab
  activeTabFour: string = 'medication'; // Default tab
  setActiveTabFour(tab: string): void {
    this.activeTabFour = tab;
  }

  code = [
    { code: 'A001', admission: false, discharge: false, working: false, preop: false, surgery: false, cause: false, department: false, hospital: false },
    { code: 'B002', admission: true, discharge: false, working: true, preop: false, surgery: true, cause: false, department: true, hospital: false },
    { code: 'C003', admission: false, discharge: true, working: false, preop: true, surgery: false, cause: true, department: false, hospital: true },
    { code: 'D004', admission: true, discharge: true, working: true, preop: false, surgery: true, cause: false, department: false, hospital: false },
    { code: 'E005', admission: false, discharge: false, working: false, preop: false, surgery: false, cause: false, department: true, hospital: true },
    { code: 'F006', admission: true, discharge: false, working: false, preop: true, surgery: false, cause: true, department: true, hospital: false },
    { code: 'G007', admission: false, discharge: false, working: true, preop: false, surgery: true, cause: false, department: false, hospital: true },
    { code: 'H008', admission: true, discharge: true, working: true, preop: true, surgery: true, cause: true, department: true, hospital: true }
  ];


}
