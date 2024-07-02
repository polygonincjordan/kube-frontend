import { Component, Input, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-bleending-tab',
  templateUrl: './bleending-tab.component.html',
  styleUrls: ['./bleending-tab.component.scss'],
})
export class BleendingTabComponent implements OnInit {
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
