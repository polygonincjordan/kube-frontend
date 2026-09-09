import { Component, Input, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-discharge-plan-tab',
  templateUrl: './discharge-plan-tab.component.html',
  styleUrls: ['./discharge-plan-tab.component.scss']
})
export class DischargePlanTabComponent implements OnInit {
  @Input() nursingDischargeForm: FormGroup;
  @Input() dischargeDropdownValue: any;

  constructor() { }

  ngOnInit(): void {
  }

}
