import { Component, Input, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-knowledge-deficit-tab',
  templateUrl: './knowledge-deficit-tab.component.html',
  styleUrls: ['./knowledge-deficit-tab.component.scss']
})
export class KnowledgeDeficitTabComponent implements OnInit {
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
