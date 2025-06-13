import { Component, Input, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-tissue-integrity-tab',
  templateUrl: './tissue-integrity-tab.component.html',
  styleUrls: ['./tissue-integrity-tab.component.scss']
})
export class TissueIntegrityTabComponent implements OnInit {
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
