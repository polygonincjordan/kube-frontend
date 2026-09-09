import { Component, Input, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { musculoskeletalList, notificationList, sleepRestList, useOfList } from '../dropdown-value';

@Component({
  selector: 'app-assessment-section',
  templateUrl: './assessment-section.component.html',
  styleUrls: ['./assessment-section.component.scss'],
})
export class AssessmentSectionComponent implements OnInit {
  @Input() nursingAdmissionForm: FormGroup;
  @Input() isFormValidError: boolean
  public isFunctionalAssessemnt: boolean = true;
  public isNutritionalRisk: boolean = false;
  public isSleepRest: boolean = false;

  musculoskeletalList = musculoskeletalList;
  useOfList = useOfList;
  notificationList = notificationList;
  sleepRestList = sleepRestList;

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
      FunAssEquipmentUseOfTyp: '',
      FunAssEquipmentUseOfTxt: '',
    });
  }

  checkUseOfCheck() {
    this.nursingAdmissionForm.patchValue({
      FunAssEquipmentUseOfTyp: '',
      FunAssEquipmentUseOfTxt: ''
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
        [`${group}Score`]: `${scoreValue} ${this.getScoreLabel(scoreValue)}`,
      });
    } else {
      this.nursingAdmissionForm.patchValue({
        [`${group}Score`]: '' ,
      });
    }
    this.calculateTotalScore();
  }

  getScoreLabel(score) {
    if(score == 0) {
      return "Absent"
    } else if(score == 1) {
      return 'Mild'
    } else if(score == 2) {
      return 'Moderate'
    } else if(score == 3) {
      return 'Severe'
    }
  }

  calculateTotalScore(): void {
    const impairedNutritionalScore = this.parseScore(this.nursingAdmissionForm.get('ImpairedNutritionalScore').value);
    const severityDiseaseScore = this.parseScore(this.nursingAdmissionForm.get('SeverityDiseaseScore').value);
    const totalScore = impairedNutritionalScore + severityDiseaseScore;
    this.nursingAdmissionForm.patchValue({
      TotalScore: `${totalScore} ${this.getTotalScoreLabel(totalScore)}`,
    })
  }

  getTotalScoreLabel(score) {
    if(score == 0 || score == 1) {
      return "Low"
    } else if(score == 2) {
      return 'Moderate'
    } else if(score > 2) {
      return 'High'
    }
  }

  parseScore(scoreString: string): number {
    if(scoreString) {
      const scoreParts = scoreString.split(' ');
      return scoreParts.length > 0 ? parseInt(scoreParts[0], 10) : 0;
    } else {
      return 0
    }
  }

  selfCaringUncheck() {
    this.nursingAdmissionForm.patchValue({
      FunSelfNeedsSuper: false,
      FunSelfNeedsFeeding: false,
      FunSelfNeedsHygiene: false,
      FunSelfNeedsToileting: false,
      FunSelfNeedsAmulation: false,
    });
  }
}
