import { Component, Input, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-activity-rest-tab',
  templateUrl: './activity-rest-tab.component.html',
  styleUrls: ['./activity-rest-tab.component.scss'],
})
export class ActivityRestTabComponent implements OnInit {
  @Input() nursingCarePlanForm: FormGroup;

  constructor() {}

  ngOnInit(): void {}

  onCheckboxChange(changedCheckbox: string, otherCheckboxes: string[]) {
    if (this.nursingCarePlanForm.get(changedCheckbox).value) {
      otherCheckboxes.forEach(checkbox => {
        this.nursingCarePlanForm.get(checkbox).setValue(false);
      });
    }
  }
}
