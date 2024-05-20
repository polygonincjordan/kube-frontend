import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { EmergencyService } from '@services/emergency-dashboard/emergency-service';
import { PatientDocumentationService } from '@services/patient-documentation.service';
import { SharedService } from '@services/shared.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'haemodialysis-access',
  templateUrl: './haemodialysis-access.component.html',
  styleUrls: ['./haemodialysis-access.component.scss']
})
export class HaemodialysisAccessComponent implements OnInit {
haemodial: FormGroup<any>;
private subscription: Subscription;

constructor(private sharedService: SharedService, private emergencyService: EmergencyService, protected patientDocService: PatientDocumentationService) {
  this.haemodial = this.patientDocService.dialysisAssecementForm
}

  ngOnInit(): void {
  }

checkChange(event: Event){
  const {name,checked} = event.target as HTMLInputElement;
  this.patientDocService.checkChange(name,checked)
}

  createAssessment() {
    console.log(this.haemodial.value);
  }

}

