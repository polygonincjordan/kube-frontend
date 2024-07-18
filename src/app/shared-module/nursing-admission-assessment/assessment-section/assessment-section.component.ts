import { Component, Input, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-assessment-section',
  templateUrl: './assessment-section.component.html',
  styleUrls: ['./assessment-section.component.scss'],
})
export class AssessmentSectionComponent implements OnInit {
  @Input() nursingAdmissionForm: FormGroup;
  public isFunctionalAssessemnt: boolean = true;
  public isNutritionalRisk: boolean = false;
  public isSleepRest: boolean = false;

  musculoskeletalList = [
    {
      label: 'Deformities',
      value: '0',
    },
    {
      label: 'Contractures',
      value: '1',
    },
    {
      label: 'Amputee',
      value: '2',
    },
    {
      label: 'Bedridden',
      value: '3',
    },
    {
      label: 'Musculoskeletal Pain',
      value: '4',
    },
  ];

  useOfList = [
    {
      label: 'Walker',
      value: '0',
    },
    {
      label: 'Wheel Chair',
      value: '1',
    },
    {
      label: 'Transfer Device',
      value: '2',
    },
    {
      label: 'Bathing Device',
      value: '3',
    },
    {
      label: 'Raised Device',
      value: '4',
    },
    {
      label: 'Others',
      value: '5',
    },
  ];

  notificationList = [
    {
      label: 'Yes',
      value: '0',
    },
    {
      label: 'No',
      value: '1',
    },
  ];
  sleepRestList = [
    {
      label: 'Crib',
      value: '0',
    },
    {
      label: 'Bed',
      value: '1',
    },
    {
      label: 'Sleep Alone',
      value: '2',
    },
    {
      label: 'Sleep with Parent or Sibling',
      value: '3',
    },
  ];
  totalScore: number;
  constructor() {}

  ngOnInit(): void {}

  public assessmentTabSelect(tab: string) {
    this.isFunctionalAssessemnt = false;
    this.isSleepRest = false;
    this.isNutritionalRisk = false;

    if (tab == 'functional') {
      this.isFunctionalAssessemnt = true;
    } else if (tab == 'nutritional') {
      this.isNutritionalRisk = true;
    } else if (tab == 'sleep') {
      this.isSleepRest = true;
    }
  }

  isGeOstomyTypeTxtDisabled(formControlName: string): boolean {
    return !this.nursingAdmissionForm.get(formControlName).value;
  }

  isInputDisabled(formControlName: string, value: any): boolean {
    const control = this.nursingAdmissionForm.get(formControlName);
    return control ? control.value != value : false;
  }

  checkBoxDisabled(formControlName: string) {
    return this.nursingAdmissionForm.get(formControlName).value == true
      ? true
      : null;
  }
  
  supervisionCheckboxDisabled(formControlName: string) {
    return this.nursingAdmissionForm.get(formControlName).value == false
      ? true
      : null;
  }

  useOfAssessment() {
    this.nursingAdmissionForm.patchValue({
      FunAssEquipmentUseOf: false,
      FunAssEquipmentUseOfTyp: "",
      FunAssEquipmentUseOfTxt: "",
    })
  }

  onCheckboxChange(
    group: string,
    index: number,
    otherIndexes: number[],
    scoreValue: number
  ): void {
    const controls = this.nursingAdmissionForm.controls;
    const changedCheckbox = `${group}${index}`;
    const otherCheckboxes = otherIndexes.map((i) => `${group}${i}`);

    if (controls[changedCheckbox].value) {
      otherCheckboxes.forEach((checkbox) => {
        controls[checkbox].setValue(false, { emitEvent: false });
      });
      this.nursingAdmissionForm.patchValue({
        [`${group}Score`]: scoreValue,
      });
    } else {
      this.nursingAdmissionForm.patchValue({
        [`${group}Score`]: 0,
      });
    }
    this.calculateTotalScore();
  }

  calculateTotalScore(): void {
    const totalScore =
      this.nursingAdmissionForm.get('ImpairedNutritionalScore').value +
      this.nursingAdmissionForm.get('SeverityDiseaseScore').value;
    this.nursingAdmissionForm.patchValue({ TotalScore: totalScore });
  }

  selfCaringUncheck() {
    this.nursingAdmissionForm.patchValue({
      FunSelfNeedsSuper: false,
      FunSelfNeedsFeeding: false,
      FunSelfNeedsHygiene: false,
      FunSelfNeedsToileting: false,
      FunSelfNeedsAmulation: false,
    })
  }
}
