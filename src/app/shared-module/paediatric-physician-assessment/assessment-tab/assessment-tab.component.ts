import { Component, Input, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-assessment-tab',
  templateUrl: './assessment-tab.component.html',
  styleUrls: ['./assessment-tab.component.scss']
})
export class AssessmentTabComponent implements OnInit {

  @Input() nursingAdmissionForm: FormGroup;
  selectedTabName: string = 'Glowth & Development';

  tabList = [
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

  yesNoList = [
    {
      label: 'Yes',
      value: '0'
    },
    {
      label: 'No',
      value: '1'
    },
  ]

  growthStatus = [
    {
      label: 'Ealry development',
      value: '0'
    },
    {
      label: 'Milestones met',
      value: '1'
    },
    {
      label: 'Development delay',
      value: '2'
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
