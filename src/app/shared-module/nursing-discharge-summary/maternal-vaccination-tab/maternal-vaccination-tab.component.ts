import { Component, Input, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-maternal-vaccination-tab',
  templateUrl: './maternal-vaccination-tab.component.html',
  styleUrls: ['./maternal-vaccination-tab.component.scss'],
})
export class MaternalVaccinationTabComponent implements OnInit {
  @Input() dischargeDropdownValue: any = [];
  @Input() nursingDischargeForm: FormGroup;

  constructor() {}

  ngOnInit(): void {}
}
