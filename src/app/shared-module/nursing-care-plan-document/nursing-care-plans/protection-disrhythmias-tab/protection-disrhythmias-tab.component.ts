import { Component, Input, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-protection-disrhythmias-tab',
  templateUrl: './protection-disrhythmias-tab.component.html',
  styleUrls: ['./protection-disrhythmias-tab.component.scss']
})
export class ProtectionDisrhythmiasTabComponent implements OnInit {
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
