import { Component } from '@angular/core';
import { AddministrationService } from '@services/e-Prescription/Administration.service';
import { EPrescriptionService } from '@services/e-Prescription/e-prescription.service';

@Component({
  selector: 'app-prior-admission',
  templateUrl: './prior-admission.component.html',
  styleUrls: ['./prior-admission.component.scss']
})
export class PriorAdmissionComponent {
  constructor(public ePrescriptionService: EPrescriptionService, public addministrationService: AddministrationService) {
    addministrationService.searchMedicationProfile = ""
   }

}
