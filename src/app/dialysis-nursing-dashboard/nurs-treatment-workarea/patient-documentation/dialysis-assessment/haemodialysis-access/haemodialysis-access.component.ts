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
hemodialysis: FormGroup<any>;
private subscription: Subscription;
isEnableSelection: boolean = false;

constructor(private sharedService: SharedService, private emergencyService: EmergencyService, public patientDocService: PatientDocumentationService) {
  this.hemodialysis = this.patientDocService.dialysisAssecementForm.controls['hemodialysis'];
}

  ngOnInit(): void {
    this.patientDocService.isHaSOtherChecked = false;
    this.patientDocService.isHaAOtherChecked = false;
    this.patientDocService.isDiOtherChecked = false;
  }

  onSelectionChange(event){
    if(event === '0'){
      this.isEnableSelection = true;
    }else{
      this.isEnableSelection = false;
      this.hemodialysis.get("BloodDrawTxt").patchValue("")
    }
  }

  createAssessment() {
    console.log(this.hemodialysis.value);
  }

}

