import { Component, Input, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-assessment-tab',
  templateUrl: './assessment-tab.component.html',
  styleUrls: ['./assessment-tab.component.scss']
})
export class AssessmentTabComponent implements OnInit {

  @Input() nursingAdmissionForm: FormGroup;
  selectedTabName: string = 'Functional Assessment';

  tabList = [
    'Functional Assessment',
    'Sleep/Rest',
    'Glowth & Development',
    'Social Screening',
  ];

  sleepRest = [
    {
      label: 'Crib',
      value: '0'
    },
    {
      label: 'Bed',
      value: '1'
    },
    {
      label: 'Sleep alone',
      value: '2'
    },
    {
      label: 'Sleep with parent or sibling',
      value: '3'
    },
  ]

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
