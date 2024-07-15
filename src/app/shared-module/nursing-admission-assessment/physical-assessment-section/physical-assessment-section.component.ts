import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-physical-assessment-section',
  templateUrl: './physical-assessment-section.component.html',
  styleUrls: ['./physical-assessment-section.component.scss'],
})
export class PhysicalAssessmentSectionComponent implements OnInit {
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

  constructor() {}

  ngOnInit(): void {}

  assessmentTabSelect(tabName: string) {
    this.selectedTabName = tabName;
  }
}
