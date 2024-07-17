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

  statusList = ['Yes', 'No'];

  vaccinationDrodownList = [
    {
      label: 'BCG',
      value: '0',
    },
    {
      label: '(DTaP+ IPV+Hib) HBV, RV',
      value: '1',
    },
    {
      label: '(DTaP+ IPV+Hib) HBV, OPV, RV',
      value: '2',
    },
    {
      label: 'OPV, Measles',
      value: '3',
    },
    {
      label: 'MMR',
      value: '4',
    },
    {
      label: 'MMR, OPV, DTP',
      value: '5',
    },
    {
      label: 'MMR, OPV, Td',
      value: '6',
    },
    {
      label: 'Td',
      value: '7',
    },
    {
      label: 'Hbv',
      value: '8',
    },
    {
      label: 'Hzv',
      value: '9',
    },
    {
      label: 'Others',
      value: '10',
    },
  ];

  InfactiousDrodownList = [
    {
      label: 'Chiken pox',
      value: '0',
    },
    {
      label: 'Pertussis',
      value: '1',
    },
    {
      label: 'Influenza',
      value: '2',
    },
    {
      label: 'Meningitis',
      value: '3',
    },
    {
      label: 'Measles',
      value: '4',
    },
    {
      label: 'Rubella',
      value: '5',
    },
    {
      label: 'Mumps',
      value: '6',
    },
    {
      label: 'Other',
      value: '7',
    },
  ];

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
