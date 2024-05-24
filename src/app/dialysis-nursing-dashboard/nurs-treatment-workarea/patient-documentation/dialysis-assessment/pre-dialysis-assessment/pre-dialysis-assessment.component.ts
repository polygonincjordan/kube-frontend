import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { EmergencyService } from '@services/emergency-dashboard/emergency-service';
import { PatientDocumentationService } from '@services/patient-documentation.service';
import { SharedService } from '@services/shared.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'pre-dialysis-assessment',
  templateUrl: './pre-dialysis-assessment.component.html',
  styleUrls: ['./pre-dialysis-assessment.component.scss']
})
export class PreDialysisAssessmentComponent implements OnInit {
  predialysis: FormGroup<any>;
  private subscription: Subscription;

  constructor(private sharedService: SharedService, private emergencyService: EmergencyService, private patientDocService: PatientDocumentationService) {
    this.predialysis = this.patientDocService.dialysisAssecementForm;
    this.patientDocService.dialysisAssecementForm.get('TreatmentDate').patchValue(new Date());
    this.patientDocService.dialysisAssecementForm.get('DialysisFDate').patchValue(new Date());
    this.patientDocService.dialysisAssecementForm.get('TreatmentTime').patchValue(new Date());
    this.patientDocService.dialysisAssecementForm.get('DialysisFTime').patchValue(new Date());

    const date = new Date();
    date.setMinutes(0);
    date.setSeconds(0);

    this.patientDocService.dialysisAssecementForm.get('PrescribedTime').patchValue(date);
  }

  ngOnInit(): void {

  }

  createAssessment() {
    console.log(this.predialysis.value);
  }

}
