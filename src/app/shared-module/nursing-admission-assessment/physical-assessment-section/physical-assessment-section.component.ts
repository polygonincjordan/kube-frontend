import { Component, Input, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-physical-assessment-section',
  templateUrl: './physical-assessment-section.component.html',
  styleUrls: ['./physical-assessment-section.component.scss'],
})
export class PhysicalAssessmentSectionComponent implements OnInit {
  @Input() nursingAdmissionForm: FormGroup;
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

  urineColorOptions = [
    { value: '0', label: 'N/A' },
    { value: '1', label: 'Yellow' },
    { value: '2', label: 'Pale' },
    { value: '3', label: 'Amber' },
    { value: '4', label: 'Orange' },
    { value: '5', label: 'Red' },
    { value: '6', label: 'Yellow-Brown' },
    { value: '7', label: 'Green-Brown' },
    { value: '8', label: 'Dark-Brown' },
  ];

  micturitionList = [
    { value: '0', label: 'Normal' },
    { value: '1', label: 'Increased' },
    { value: '2', label: 'Decreased' },
  ];
  moistureList = [
    { value: '0', label: 'Moist' },
    { value: '1', label: 'Dry' },
    { value: '2', label: 'Diaphoretic' },
    { value: '3', label: 'Night Sweats' },
  ];
  temperatureList = [
    { value: '0', label: 'Warm' },
    { value: '1', label: 'Cool' },
  ];
  lesionsList = [
    { value: '0', label: 'Present' },
    { value: '1', label: 'Absent' },
  ];
  capiliaryList = [
    { value: '0', label: '< = 3 seconds' },
    { value: '1', label: '> 3 seconds' },
  ];
  skinColorList = [
    { value: '0', label: 'Normal' },
    { value: '1', label: 'Pale' },
    { value: '2', label: 'Jaundice' },
    { value: '3', label: 'Mottled' },
    { value: '4', label: 'Flushed' },
    { value: '5', label: 'Petechiae' },
    { value: '6', label: 'Cyanotic' },
    { value: '7', label: 'Others' },
  ];

  earsNoseNickDropdownValue = [
    {
      label: 'Right',
      value: '0',
    },
    {
      label: 'Left',
      value: '1',
    },
    {
      label: 'Both',
      value: '2',
    },
  ];

  chestAppearanceList = [
    {
      label: 'Symmetrical',
      value: '0',
    },
    {
      label: 'Asymmetrical',
      value: '1',
    },
  ];

  constructor() {}

  ngOnInit(): void {}

  assessmentTabSelect(tabName: string) {
    this.selectedTabName = tabName;
  }

  isInputDisabled(formControlName: string, value: any): boolean {
    const control = this.nursingAdmissionForm.get(formControlName);
    return control ? control.value != value : false;
  }

  isGeOstomyTypeTxtDisabled(formControlName: string): boolean {
    return !this.nursingAdmissionForm.get(formControlName).value;
  }
}
