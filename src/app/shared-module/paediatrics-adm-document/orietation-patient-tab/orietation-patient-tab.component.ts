import { Component, Input, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-orietation-patient-tab',
  templateUrl: './orietation-patient-tab.component.html',
  styleUrls: ['./orietation-patient-tab.component.scss']
})
export class OrietationPatientTabComponent implements OnInit {
  @Input() nursingAdmissionForm: FormGroup;

  valueableList = [
    {
      label: 'Yes',
      value: '0'
    },
    {
      label: 'No',
      value: '1'
    },
  ]
  constructor() { }

  ngOnInit(): void {
  }

}
