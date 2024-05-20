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
  postdialevalution: FormGroup<any>;
  constructor(private sharedService: SharedService, private emergencyService: EmergencyService, private patientDocService: PatientDocumentationService) {
    this.postdialevalution = this.patientDocService.dialysisAssecementForm

   }

  ngOnInit(): void {

  }

  createAssessment() {
    console.log(this.postdialevalution.value);
  }
}
