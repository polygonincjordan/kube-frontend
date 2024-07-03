import { Component, Input, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-acute-pain-tab',
  templateUrl: './acute-pain-tab.component.html',
  styleUrls: ['./acute-pain-tab.component.scss']
})
export class AcutePainTabComponent implements OnInit {
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
