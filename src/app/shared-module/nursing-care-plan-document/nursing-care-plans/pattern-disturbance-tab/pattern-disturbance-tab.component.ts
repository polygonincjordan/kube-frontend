import { Component, Input, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-pattern-disturbance-tab',
  templateUrl: './pattern-disturbance-tab.component.html',
  styleUrls: ['./pattern-disturbance-tab.component.scss']
})
export class PatternDisturbanceTabComponent implements OnInit {
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
