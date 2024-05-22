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
isEnableSelection: boolean = false;

constructor(private sharedService: SharedService, private emergencyService: EmergencyService, protected patientDocService: PatientDocumentationService) {
  this.haemodial = this.patientDocService.dialysisAssecementForm
}

  ngOnInit(): void {
    this.patientDocService.isHaSOtherChecked = false;
    this.patientDocService.isHaAOtherChecked = false;
    this.patientDocService.isDiOtherChecked = false;
  }

  onSelectionChange(event){
    if(event === '1'){
      this.isEnableSelection = true;
    }else{
      this.isEnableSelection = false;
      this.haemodial.get("BloodDrawTxt").patchValue("")
    }
  }

  createAssessment() {
    console.log(this.haemodial.value);
  }

}

