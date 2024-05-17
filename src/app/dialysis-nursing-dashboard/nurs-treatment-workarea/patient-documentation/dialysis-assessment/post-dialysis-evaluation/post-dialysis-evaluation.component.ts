import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { EmergencyService } from '@services/emergency-dashboard/emergency-service';
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
  constructor(private sharedService: SharedService, private emergencyService: EmergencyService) { }

  ngOnInit(): void {
this.postdialevalution = new FormGroup({
  PTreatmentDate : new FormControl(),
  PTreatmentTime : new FormControl(),
  PPostWeight: new FormControl(),
  PAxillaryTemp : new FormControl(),
  POralTemp : new FormControl(),
  PPulseRate : new FormControl(),
  PRespiratoryRate : new FormControl(),
  POxygenSaturation  :new FormControl(),
  POxygenFlow : new FormControl(),
  POxygenDelivery : new FormControl(),
  PSystolicBloodSitting :new FormControl(),
  PDiastolicBloodSitting : new FormControl(),
  PArterialPressure : new FormControl(),
  PSystolicBloodStanding : new FormControl(),
  PDiastolicBloodStanding : new FormControl(),
  PBvp : new FormControl(),
  PKt : new FormControl(),
  PDialyserClearance : new FormControl(),
  PHypotension : new FormControl(),
});
  }

  createAssessment() {
    console.log(this.postdialevalution.value);
  }
}
