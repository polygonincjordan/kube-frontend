import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-obs-fall-risk-assessment',
  templateUrl: './obs-fall-risk-assessment.component.html',
  styleUrls: ['./obs-fall-risk-assessment.component.scss']
})
export class ObsFallRiskAssessmentComponent implements OnInit {

  // Prior History
  priorOptions = [
    { label: '(2) HX of a fall', value: 2, checked: false },
    { label: '(2) HX of a bedrest', value: 2, checked: false },
    { label: '(3) Visual Impairment', value: 3, checked: false },
    { label: '(0) None', value: 0, checked: false }
  ];

  // Cardiovascular
  cardiovascularOptions = [
    { label: '(2) HX of anemia or preeclampsia', value: 2, checked: false },
    { label: '(3) Orthostatic', value: 3, checked: false },
    { label: '(2) Dizziness', value: 2, checked: false },
    { label: '(0) None', value: 0, checked: false }
  ];

  // Hemorrhage
  hemorrhageOptions = [
    { label: '(3) PP Hemorrhage', value: 3, checked: false },
    { label: '(3) DX abruption or previa', value: 3, checked: false },
    { label: '(0) None', value: 0, checked: false }
  ];

  // Medication
  medicationOptions = [
    { label: '(1) IV / IM Narcotics w in 30 min', value: 1, checked: false },
    { label: '(3) Anti-hypertensives', value: 3, checked: false },
    { label: '(0) None', value: 0, checked: false }
  ];

  priorValue = 0;
  cardiovascularValue = 0;
  hemorrhageValue = 0;
  motorValue = 0;
  medicationValue = 0;

  totalScore: any;


  constructor() { }

  ngOnInit(): void {
  }

  updateCheckboxValue(options: any[], maxOptions: number): number {
    const noneOption = options.find(opt => opt.isNone);
    if (noneOption?.checked) {
      // If "None" is selected, uncheck all others
      options.forEach(opt => {
        if (!opt.isNone) opt.checked = false;
      });
      return 0;
    } else {
      // If any other is selected, uncheck "None"
      if (noneOption) noneOption.checked = false;
    }

    // Sum up all checked values
    const total = options
      .filter(opt => opt.checked)
      .reduce((sum, opt) => sum + opt.value, 0);
    return total;
  }

  calculateTotalScore() {
    this.totalScore = this.priorValue + this.cardiovascularValue + this.hemorrhageValue + this.motorValue + this.medicationValue;
  }

  // For radio
  updateRadioValue(val: number) {
    this.motorValue = val;
    this.calculateTotalScore();
  }

}
