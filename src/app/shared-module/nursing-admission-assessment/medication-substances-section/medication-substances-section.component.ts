import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-medication-substances-section',
  templateUrl: './medication-substances-section.component.html',
  styleUrls: ['./medication-substances-section.component.scss'],
})
export class MedicationSubstancesSectionComponent implements OnInit {
  noMedication: boolean = false;
  medicationList: any[] = [];
  constructor() {}

  ngOnInit(): void {}
}
