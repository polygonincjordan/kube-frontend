import { Component, Input, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-infant-feeding-pattern-tab',
  templateUrl: './infant-feeding-pattern-tab.component.html',
  styleUrls: ['./infant-feeding-pattern-tab.component.scss']
})
export class InfantFeedingPatternTabComponent implements OnInit {
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
