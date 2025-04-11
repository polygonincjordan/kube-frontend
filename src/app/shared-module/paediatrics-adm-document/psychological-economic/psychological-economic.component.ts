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
