import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormGroup } from '@angular/forms';
import {
  InfactiousDrodownList,
  IsolationList,
  statusList,
  vaccinationDrodownList,
  statusListForVaccination
} from '../../nursing-admission-assessment/dropdown-value';

@Component({
  selector: 'app-vaccination-exposure-section',
  templateUrl: './vaccination-exposure-section.component.html',
  styleUrls: ['./vaccination-exposure-section.component.scss'],
})
export class VaccinationExposureSectionComponent implements OnInit {
  selectedTabName: string = 'Vaccination History';
  @Output() addTableRow = new EventEmitter<any>();
  @Input() nursingAdmissionForm: FormGroup;

  tabList = ['Vaccination History', 'Exposure to Infectious Diseases'];

  IsolationList = IsolationList;
  statusList = statusList;
  statusListForVaccination = statusListForVaccination;
  vaccinationDrodownList = vaccinationDrodownList;
  InfactiousDrodownList:any[] = InfactiousDrodownList;

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

  addRow() {
    this.addTableRow.emit(this.selectedTabName);
  }

  passDataInPerantComponent() {
    // this.vaccinationDataPass.emit(this.selectedTabName);
  }
}
