import { Component, Input, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-hypothermia-tab',
  templateUrl: './hypothermia-tab.component.html',
  styleUrls: ['./hypothermia-tab.component.scss']
})
export class HypothermiaTabComponent implements OnInit {
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
