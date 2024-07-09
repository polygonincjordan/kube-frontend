import { Component, Input, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-environmental-safety-tab',
  templateUrl: './environmental-safety-tab.component.html',
  styleUrls: ['./environmental-safety-tab.component.scss'],
})
export class EnvironmentalSafetyTabComponent implements OnInit {
  @Input() dischargeDropdownValue: any;
  @Input() nursingDischargeForm: FormGroup;

  constructor() {}

  ngOnInit(): void {}

  envAssessment(event?: any) {
    if(this.nursingDischargeForm.get('EnvironmentalAss').value == '2') {
      this.nursingDischargeForm.patchValue({
        EsShower: false,
        EsTub: false,
        EsRefrigerator: false,
        EsCool: false,
        EsToilet: false,
        EsDoorway: false,
        EsStairs: false,
        EsOther: false,
        EsOtherTxt: '',
      });
    }
  }
}
