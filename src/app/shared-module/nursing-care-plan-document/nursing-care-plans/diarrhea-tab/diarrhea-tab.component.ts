import { Component, Input, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-diarrhea-tab',
  templateUrl: './diarrhea-tab.component.html',
  styleUrls: ['./diarrhea-tab.component.scss']
})
export class DiarrheaTabComponent implements OnInit {
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
