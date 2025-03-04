import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-newborn-assessment',
  templateUrl: './newborn-assessment.component.html',
  styleUrls: ['./newborn-assessment.component.scss']
})
export class NewbornAssessmentComponent implements OnInit {

  selectedTabName: string = 'Gastrontestinal';

  tabList = [
    'Gastrontestinal',
    'Reproductive',
    'Genitourinary',
    'Skin/Integumentary',
    'Neurological',
    'Cardiovascular',
    'Ears/Nose/Throat',
    'Ophthalmology',
    'Respiratory',
  ];
  constructor() { }

  ngOnInit(): void {
  }

  assessmentTabSelect(tabName: string) {
    this.selectedTabName = tabName;
  }
}
