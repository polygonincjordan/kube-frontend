import { Component, Input, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-fall-risk-tab',
  templateUrl: './fall-risk-tab.component.html',
  styleUrls: ['./fall-risk-tab.component.scss']
})
export class FallRiskTabComponent implements OnInit {
  @Input() nursingCarePlanForm: FormGroup;
  @Input() isReadOnly : boolean =false;

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
