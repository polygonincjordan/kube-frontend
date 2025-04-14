import { Component, Input, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-examination-tab',
  templateUrl: './examination-tab.component.html',
  styleUrls: ['./examination-tab.component.scss']
})
export class ExaminationTabComponent implements OnInit {

  @Input() nursingAdmissionForm: FormGroup;
  selectedTabName: string = 'Physical Examination';

  tabList = [
    'Physical Examination',
    'Sexual Development',
  ];

  modePhysicalList = [
    {
      label: 'Normal',
      value: '0'
    },
    {
      label: 'Abnormal',
      value: '1'
    },
  ]
  constructor() { }

  ngOnInit(): void {
  }

  assessmentTabSelect(tabName: string) {
    this.selectedTabName = tabName;
  }


}
