import { Component, Input, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-medication-substances-section',
  templateUrl: './medication-substances-section.component.html',
  styleUrls: ['./medication-substances-section.component.scss'],
})
export class MedicationSubstancesSectionComponent implements OnInit {
  noMedication: boolean = false;
  medicationList: any[] = [];
  @Input() nursingAdmissionForm: FormGroup;
  @Input() isReadOnly: boolean = false;

  constructor() {}

  ngOnInit(): void {}
}
