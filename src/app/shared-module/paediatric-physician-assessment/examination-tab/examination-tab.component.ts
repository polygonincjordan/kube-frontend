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
    // 'Sexual Development',
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
  functionalAssessment = [
    {
      label: 'Feeding',
      value: '0'
    },
    {
      label: 'Toileting',
      value: '1'
    },
    {
      label: 'Dressing',
      value: '1'
    },
    {
      label: 'Grooming',
      value: '1'
    },
    {
      label: 'Walking',
      value: '1'
    },
    {
      label: 'Transfer',
      value: '1'
    },
    {
      label: 'Mobility',
      value: '1'
    }
  ]
  constructor() { }

  ngOnInit(): void {
  }

  assessmentTabSelect(tabName: string) {
    this.selectedTabName = tabName;
  }


}
