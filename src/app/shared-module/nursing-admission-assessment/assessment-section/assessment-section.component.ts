import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-assessment-section',
  templateUrl: './assessment-section.component.html',
  styleUrls: ['./assessment-section.component.scss'],
})
export class AssessmentSectionComponent implements OnInit {
  public isFunctionalAssessemnt: boolean = true;
  public isNutritionalRisk: boolean = false;
  public isSleepRest: boolean = false;
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
}
