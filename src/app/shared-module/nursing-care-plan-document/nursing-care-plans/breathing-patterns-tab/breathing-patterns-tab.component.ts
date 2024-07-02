import { Component, Input, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-breathing-patterns-tab',
  templateUrl: './breathing-patterns-tab.component.html',
  styleUrls: ['./breathing-patterns-tab.component.scss']
})
export class BreathingPatternsTabComponent implements OnInit {
  @Input() nursingCarePlanForm: FormGroup;
  constructor() { }

  ngOnInit(): void {
  }

  onCheckboxChange(changedCheckbox: string, otherCheckboxes: string[]) {
    if (this.nursingCarePlanForm.get(changedCheckbox).value) {
      otherCheckboxes.forEach(checkbox => {
        this.nursingCarePlanForm.get(checkbox).setValue(false);
      });
    }
  }

}
