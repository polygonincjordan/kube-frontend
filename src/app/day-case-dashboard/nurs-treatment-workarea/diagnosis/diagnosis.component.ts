import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { AdmissionService } from '@services/admission/admission.service';

@Component({
  selector: 'app-diagnosis',
  templateUrl: './diagnosis.component.html',
  styleUrls: ['./diagnosis.component.scss']
})
export class DiagnosisComponent implements OnInit {

  isEnCounterCheck: boolean = true;
  isPatientCheck: boolean = false;
  @Output() onSearchChangEventForDiagnosis = new EventEmitter();
  @Output() enCounterPatient = new EventEmitter();


  constructor( public admissionService: AdmissionService,) { }

  ngOnInit(): void {
  }

  onSearchChange(event: any): void {
    this.onSearchChangEventForDiagnosis.next(event.target.value);
  }

  selectCheckBox(select: string) {
    if (select == 'Encounter') {
      this.isEnCounterCheck = true;
      this.isPatientCheck = false;
    } else {
      this.isEnCounterCheck = false;
      this.isPatientCheck = true;
    }

    this.enCounterPatient.next({isEnCounterCheck: this.isEnCounterCheck, isPatientCheck: this.isPatientCheck})
  }
}
