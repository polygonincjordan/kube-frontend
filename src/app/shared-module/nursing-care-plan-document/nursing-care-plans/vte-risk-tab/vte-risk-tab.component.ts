import { Component, Input, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-vte-risk-tab',
  templateUrl: './vte-risk-tab.component.html',
  styleUrls: ['./vte-risk-tab.component.scss']
})
export class VteRiskTabComponent implements OnInit {
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
