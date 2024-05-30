import { Component, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { EmergencyService } from '@services/emergency-dashboard/emergency-service';
import { PatientDocumentationService } from '@services/patient-documentation.service';
import { SharedService } from '@services/shared.service';

@Component({
  selector: 'peritoneal',
  templateUrl: './peritoneal.component.html',
  styleUrls: ['./peritoneal.component.scss']
})
export class PeritonealComponent implements OnInit {
  isEnableSelection: boolean;
  peritonealForm: FormGroup<any>;

  constructor(private sharedService: SharedService, private emergencyService: EmergencyService, protected patientDocService: PatientDocumentationService) {
    this.peritonealForm = this.patientDocService.dialysisAssecementForm.controls['peritonealForm']
  }

  ngOnInit(): void {
  }

  onSelectionChange(event){
    if(event === '3'){
      this.isEnableSelection = true;
    }else{
      this.isEnableSelection = false;
      this.peritonealForm.get("TypeDwellingTxt").patchValue("")
    }
  }
}
