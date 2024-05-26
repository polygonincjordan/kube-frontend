import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { EmergencyService } from '@services/emergency-dashboard/emergency-service';
import { PatientDocumentationService } from '@services/patient-documentation.service';
import { SharedService } from '@services/shared.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'post-dialysis-evaluation',
  templateUrl: './post-dialysis-evaluation.component.html',
  styleUrls: ['./post-dialysis-evaluation.component.scss']
})
export class PostDialysisEvaluationComponent implements OnInit {
  private subscription: Subscription;
  postDialysisMonitoring: FormGroup<any>;
  constructor(private sharedService: SharedService, private emergencyService: EmergencyService, private patientDocService: PatientDocumentationService) {
    this.postDialysisMonitoring = this.patientDocService.dialysisAssecementForm.controls['postDialysisMonitoring'];
    this.patientDocService.dialysisAssecementForm.controls['postDialysisMonitoring'].get("PTreatmentDate").patchValue(new Date());
    this.patientDocService.dialysisAssecementForm.controls['postDialysisMonitoring'].get("PTreatmentTime").patchValue(new Date());
   }

  ngOnInit(): void {

  }

  createAssessment() {
    console.log(this.postDialysisMonitoring.value);
  }
}
