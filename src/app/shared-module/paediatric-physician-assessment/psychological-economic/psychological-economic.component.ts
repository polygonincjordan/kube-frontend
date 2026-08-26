import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { InfactiousDrodownList, IsolationList, statusList, vaccinationDrodownList } from '../../nursing-admission-assessment/dropdown-value';

@Component({
  selector: 'app-psychological-economic',
  templateUrl: './psychological-economic.component.html',
  styleUrls: ['./psychological-economic.component.scss']
})
export class PsychologicalEconomicComponent implements OnInit {

selectedTabName: string = 'Psychological History';
  @Output() addTableRow = new EventEmitter<any>();
  @Input() nursingAdmissionForm: FormGroup;

  tabList = ['Psychological History', 'Economic History'];

  yesNoList = [
    {
      label: 'Yes',
      value: 'J'
    },
    {
      label: 'No',
      value: 'N'
    },
  ]
  patientRelationList = [
    {
      label: 'Parents',
      value: '1'
    },
    {
      label: 'Father',
      value: '2'
    },
    {
      label: 'Mother',
      value: '3'
    },
    {
      label: 'Grandparents',
      value: '4'
    },
    {
      label: 'Uncle / Aunt',
      value: '5'
    },
    {
      label: 'Cousin',
      value: '6'
    },
    {
      label: 'Brother / Sister',
      value: '7'
    },
    {
      label: 'Other',
      value: '8'
    }
  ]

  IsolationList = IsolationList;
  statusList = statusList;
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
