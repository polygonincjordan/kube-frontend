import { Component, Input, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-discharge-details-tab',
  templateUrl: './discharge-details-tab.component.html',
  styleUrls: ['./discharge-details-tab.component.scss'],
})
export class DischargeDetailsTabComponent implements OnInit {
  @Input() nursingDischargeForm: FormGroup;
  @Input() dischargeDropdownValue: any;
  @Input() modeOfDischargeValue: any;
  @Input() patientDischargeValue: any;
  constructor() {}

  ngOnInit(): void {}
}
