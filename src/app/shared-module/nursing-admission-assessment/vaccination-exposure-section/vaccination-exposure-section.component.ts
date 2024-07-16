import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-vaccination-exposure-section',
  templateUrl: './vaccination-exposure-section.component.html',
  styleUrls: ['./vaccination-exposure-section.component.scss'],
})
export class VaccinationExposureSectionComponent implements OnInit {
  selectedTabName: string = 'Vaccination History';

  tabList = ['Vaccination History', 'Exposure to Infectious Diseases'];

  IsolationList = [
    'Contact Isolation Precautions',
    'Droplet Isolation Precautions',
    'Airborne Isolation Precautions',
    'Protective Isolation Precautions',
  ];

  statusList =[
    'Yes','No'
  ]

  vaccinationList: any = [
    {
      vaccination: '',
      other: '',
      status: '',
      upto: false,
    },
    {
      vaccination: '',
      other: '',
      status: '',
      upto: false,
    },
    {
      vaccination: '',
      other: '',
      status: '',
      upto: false,
    },
  ];

  constructor() {}

  ngOnInit(): void {}

  selectTab(tabName: string) {
    this.selectedTabName = tabName;
  }
}
