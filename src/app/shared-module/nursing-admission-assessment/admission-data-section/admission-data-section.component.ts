import { Component, Input, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-admission-data-section',
  templateUrl: './admission-data-section.component.html',
  styleUrls: ['./admission-data-section.component.scss'],
})
export class AdmissionDataSectionComponent implements OnInit {
  @Input() nursingAdmissionForm: FormGroup;

  admissionModeList = [
    {
      label: 'Ambulatory',
      value: '0',
    },
    {
      label: 'Wheel Chair',
      value: '1',
    },
    {
      label: 'Stretcher',
      value: '2',
    },
    {
      label: 'Carried',
      value: '3',
    },
    {
      label: 'Cuddled',
      value: '4',
    },
    {
      label: 'Other',
      value: '5',
    },
  ];

  accompaniedbyList = [
    {
      label: 'Spouse',
      value: '0',
    },
    {
      label: 'Relative',
      value: '1',
    },
    {
      label: 'Parents',
      value: '2',
    },
    {
      label: 'Guardian',
      value: '3',
    },
    {
      label: 'Police Officer',
      value: '4',
    },
    {
      label: 'Civil Defense',
      value: '5',
    },
    {
      label: 'Other',
      value: '6',
    },
  ];

  infoObtainedList = [
    {
      label: 'Patient',
      value: '0',
    },
    {
      label: 'Family',
      value: '1',
    },
    {
      label: 'Friends',
      value: '2',
    },
    {
      label: 'Other',
      value: '3',
    },
  ];

  schoolGradeList = [
    {
      label: 'Educated',
      value: '0',
    },
    {
      label: 'Did not attend a school',
      value: '1',
    },
  ];

  schoolGradeEduList = [
    {
      label: 'Primary',
      value: '0',
    },
    {
      label: 'Secondary',
      value: '1',
    },
    {
      label: 'Diploma',
      value: '2',
    },
    {
      label: 'University Degree',
      value: '3',
    },
    {
      label: 'Higher Education',
      value: '4',
    },
  ];
  constructor() {}

  ngOnInit(): void {}

  selectAdmissionMode(event: any, dropdownType: string) {
    if (event != '5' && dropdownType == 'admissionMode') {
      this.nursingAdmissionForm.patchValue({ AAdmissionModeT: '' });
    }

    if (event != '6' && dropdownType == 'accompanied') {
      this.nursingAdmissionForm.patchValue({ AAccompaniedByT: '' });
    }

    if (event != '3' && dropdownType == 'obtained') {
      this.nursingAdmissionForm.patchValue({ AInfoObtainedT: '' });
    }
    if (event != '6' && dropdownType == 'accompanied') {
      this.nursingAdmissionForm.patchValue({ AAccompaniedByT: '' });
    }
  }

  isInputDisabled(formControlName: string, value: string): boolean {
    const control = this.nursingAdmissionForm.get(formControlName);
    return control ? control.value != value : false;
  }

  selectSchool(event: any) {
    if (event != '1') {
      this.nursingAdmissionForm.patchValue({
        AEducated: '',
      });
    }
  }
}
