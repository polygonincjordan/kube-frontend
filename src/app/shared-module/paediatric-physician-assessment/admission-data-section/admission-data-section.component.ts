import { Component, Input, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import {
  accompaniedbyList,
  admissionModeList,
  infoObtainedList,
  schoolGradeEduList,
  schoolGradeList,
} from '../../nursing-admission-assessment/dropdown-value';

@Component({
  selector: 'app-admission-data-section',
  templateUrl: './admission-data-section.component.html',
  styleUrls: ['./admission-data-section.component.scss'],
})
export class AdmissionDataSectionComponent implements OnInit {
  @Input() nursingAdmissionForm: FormGroup;
  @Input() isFormValidError: boolean;

  admissionModeList = admissionModeList;
  accompaniedbyList = accompaniedbyList;
  infoObtainedList = infoObtainedList;
  schoolGradeList = schoolGradeList;
  schoolGradeEduList = schoolGradeEduList;

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
    const control = this.nursingAdmissionForm?.get(formControlName);
    return control ? control.value != value : false;
  }

  selectSchool(event: any) {
    // if (event != '1') {
    //   this.nursingAdmissionForm.patchValue({
    //     AEducated: '',
    //   });
    // }
  }
}
