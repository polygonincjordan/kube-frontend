import { Component, Input, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-chest-pain-tab',
  templateUrl: './chest-pain-tab.component.html',
  styleUrls: ['./chest-pain-tab.component.scss']
})
export class ChestPainTabComponent implements OnInit {
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
