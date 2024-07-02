import { Component, Input, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-stress-tolerance',
  templateUrl: './stress-tolerance.component.html',
  styleUrls: ['./stress-tolerance.component.scss'],
})
export class StressToleranceComponent implements OnInit {
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
