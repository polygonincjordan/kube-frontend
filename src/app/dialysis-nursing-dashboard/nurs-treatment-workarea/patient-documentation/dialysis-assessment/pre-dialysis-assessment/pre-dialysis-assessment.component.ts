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
    this.predialysis = this.patientDocService.dialysisAssecementForm

  }

  ngOnInit(): void {

  }

  createAssessment() {
    console.log(this.predialysis.value);
  }

}
