import { Component, OnInit } from '@angular/core';
import { AddministrationService } from '@services/e-Prescription/Administration.service';
import { EPrescriptionService } from '@services/e-Prescription/e-prescription.service';

@Component({
  selector: 'app-prior-admission-options-nurse',
  templateUrl: './prior-admission-options-nurse.component.html',
  styleUrls: ['./prior-admission-options-nurse.component.scss']
})
export class PriorAdmissionOptionsNurseComponent  {

  constructor(public ePrescriptionService: EPrescriptionService, public addministrationService: AddministrationService) {
    addministrationService.searchMedicationProfile = ""
   }


}
